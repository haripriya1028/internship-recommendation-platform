const Recommendation = require("../models/Recommendation");
const Profile = require("../models/Profile");
const Internship = require("../models/Internship");
const {
  recommendInternships,
} = require("../services/geminiService");

const getRecommendations = async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.userId,
    });

    if (!profile) {
      return res.status(404).json({
        message: "Profile not found",
      });
    }

    const internships = await Internship.find();
    const cachedRecommendations = await Recommendation.findOne({
      user: req.params.userId,
    });

    const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
    const isCacheFresh =
      cachedRecommendations &&
      Date.now() - cachedRecommendations.updatedAt.getTime() < CACHE_TTL_MS;

    if (isCacheFresh) {
      console.log("Serving recommendations from cache");
      return res.json(cachedRecommendations.recommendations);
    }

    // ---- Stage 1: rule-based scoring (fast, deterministic recall) ----
    const scored = internships.map((internship) => {
      let score = 0;

      // Skill Match (60 points)
      const matchedSkills = internship.skillsRequired.filter((skill) =>
        profile.skills
          .map((s) => s.toLowerCase())
          .includes(skill.toLowerCase())
      );

      if (internship.skillsRequired.length > 0) {
        score += (matchedSkills.length / internship.skillsRequired.length) * 60;
      }

      // Branch Match (20 points)
      if (internship.eligibleBranches.includes(profile.branch)) {
        score += 20;
      }

      // CGPA Match (20 points)
      if (profile.cgpa >= internship.minimumCGPA) {
        score += 20;
      }

      return {
        _id: internship._id,
        title: internship.title,
        company: internship.company,
        location: internship.location,
        description: internship.description,
        skillsRequired: internship.skillsRequired,
        minimumCGPA: internship.minimumCGPA,
        eligibleBranches: internship.eligibleBranches,
        matchedSkills,
        matchScore: Math.round(score),
      };
    });

    scored.sort((a, b) => b.matchScore - a.matchScore);

    // Shortlist the top candidates so we're not shipping the entire
    // internship collection into every Gemini call.
    const SHORTLIST_SIZE = 15;
    const shortlist = scored.slice(0, SHORTLIST_SIZE);

    // ---- Stage 2: LLM re-ranking + reasoning on the shortlist only ----
    const aiRecommendations = await recommendInternships(profile, shortlist);

    // Merge Gemini's output back onto the shortlist by stable _id
    // (never by title/company text, which breaks if the model paraphrases).
    const shortlistById = new Map(
      shortlist.map((internship) => [internship._id.toString(), internship])
    );

    const finalRecommendations = aiRecommendations
      .map((aiInternship) => {
        const original = shortlistById.get(String(aiInternship.id));
        if (!original) return null;

        return {
          _id: original._id,
          title: original.title,
          company: original.company,
          location: original.location,
          description: original.description,
          skillsRequired: original.skillsRequired,
          minimumCGPA: original.minimumCGPA,
          eligibleBranches: original.eligibleBranches,
          matchedSkills: original.matchedSkills,
          ruleBasedScore: original.matchScore,
          score: aiInternship.score,
          reason: aiInternship.reason,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score);

await Recommendation.findOneAndUpdate(
  {
    user: req.params.userId,
  },
  {
    recommendations: finalRecommendations,
  },
  {
    upsert: true,
    new: true,
  }
);

res.json(finalRecommendations);
  } catch (error) {
    console.error("getRecommendations failed:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getRecommendations,
};