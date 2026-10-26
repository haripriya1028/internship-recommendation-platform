const Recommendation = require("../models/Recommendation");
const Profile = require("../models/Profile");
const Internship = require("../models/Internship");
const {
  recommendInternships,
} = require("../services/geminiService");

const VALID_STATUSES = [
  "not viewed",
  "viewed",
  "applied",
  "in progress",
  "accepted",
  "rejected",
];

const TERMINAL_STATUSES = [
  "applied",
  "in progress",
  "accepted",
  "rejected",
];

const MIN_RECOMMENDATION_SCORE = 50;

const buildFallbackRecommendations = (
  profile,
  internships
) => {
  const profileSkills = (profile.skills || []).map((s) =>
    s.toLowerCase()
  );
  const interests = (profile.interests || []).map((i) =>
    i.toLowerCase()
  );

  return internships
    .map((internship) => {
      const requiredSkills =
        internship.skillsRequired || [];
      const matchedSkills = requiredSkills.filter(
        (skill) =>
          profileSkills.includes(skill.toLowerCase())
      );

      let score = 0;

      if (requiredSkills.length > 0) {
        score +=
          (matchedSkills.length /
            requiredSkills.length) *
          50;
      }

      if (
        internship.eligibleBranches?.includes(
          profile.branch
        )
      ) {
        score += 25;
      }

      if (profile.cgpa >= internship.minimumCGPA) {
        score += 25;
      }

      const textToCheck = `${
        internship.title || ""
      } ${internship.description || ""}`.toLowerCase();
      const matchedInterests = interests.filter(
        (interest) => textToCheck.includes(interest)
      );

      if (matchedInterests.length > 0) {
        score += 10;
      }

      const finalScore = Math.min(
        100,
        Math.round(score)
      );

      return {
        title: internship.title,
        company: internship.company,
        score: finalScore,
        reason: `Matched ${matchedSkills.length}/${requiredSkills.length} required skills, branch and CGPA eligibility considered${
          matchedInterests.length > 0
            ? ", plus interest alignment"
            : ""
        }.`,
      };
    })
    .sort((a, b) => b.score - a.score);
};

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
    const cachedRecommendations =
      await Recommendation.findOne({
        user: req.params.userId,
    }); 
    

if (cachedRecommendations) {

  const normalizedRecommendations =
    cachedRecommendations.recommendations.map(
      (recommendation) => ({
        _id: recommendation._id,
        ...recommendation.toObject(),
        link:
          recommendation.link ||
          internships.find(
            (internship) =>
              String(internship._id) ===
              String(recommendation._id)
          )?.link ||
          "",
        status:
          recommendation.status || "not viewed",
      })
    );

  const filteredRecommendations =
    normalizedRecommendations.filter(
      (recommendation) =>
        Number(recommendation.score || 0) >=
        MIN_RECOMMENDATION_SCORE
    );

  const hasMissingData =
    cachedRecommendations.recommendations.some(
      (recommendation) =>
        !recommendation.status ||
        recommendation.link === undefined
    );

  const requiresScoreFiltering =
    normalizedRecommendations.length !==
    filteredRecommendations.length;

  if (hasMissingData || requiresScoreFiltering) {
    cachedRecommendations.recommendations =
      filteredRecommendations;
    await cachedRecommendations.save();
  }

  console.log("Serving recommendations from cache");

  return res.json(filteredRecommendations);

}

    /*const recommendations = internships.map((internship) => {
      let score = 0;

      // Skill Match (60 points)
      const matchedSkills = internship.skillsRequired.filter(
        (skill) =>
            profile.skills
                .map((s) => s.toLowerCase())
                .includes(skill.toLowerCase())
    );

      if (internship.skillsRequired.length > 0) {
        score +=
          (matchedSkills.length /
            internship.skillsRequired.length) *
          60;
      }

      // Branch Match (20 points)
      if (
        internship.eligibleBranches.includes(profile.branch)
      ) {
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
        matchedSkills,
        matchScore: Math.round(score),
    };
    });

    recommendations.sort(
      (a, b) => b.matchScore - a.matchScore
    );

    const topInternships = recommendations.slice(0, 5);

    const aiRecommendations =
        await recommendInternships(profile, topInternships);

    res.json(aiRecommendations);*/
    // Ask Gemini to rank internships. If unavailable, use deterministic fallback ranking.
let aiRecommendations;

try {
  aiRecommendations = await recommendInternships(
    profile,
    internships
  );
} catch (error) {
  console.error(
    "Gemini recommendation failed, using fallback:",
    error.message
  );
  aiRecommendations =
    buildFallbackRecommendations(
      profile,
      internships
    );
}

const rankedRecommendations = Array.isArray(
  aiRecommendations
)
  ? aiRecommendations
  : aiRecommendations?.recommendations || [];

const safeRecommendations =
  rankedRecommendations.length > 0
    ? rankedRecommendations
    : buildFallbackRecommendations(
        profile,
        internships
      );

// Merge Gemini results with MongoDB internship details
const finalRecommendations = safeRecommendations.map((aiInternship) => {

  const original = internships.find(
    (internship) =>
      internship.title === aiInternship.title &&
      internship.company === aiInternship.company
  );

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
    link: original.link,

    score: aiInternship.score,
    reason: aiInternship.reason,
    status: "not viewed",
  };

}).filter(Boolean);

const filteredFinalRecommendations =
  finalRecommendations.filter(
    (recommendation) =>
      Number(recommendation.score || 0) >=
      MIN_RECOMMENDATION_SCORE
  );

await Recommendation.findOneAndUpdate(
  {
    user: req.params.userId,
  },
  {
    recommendations: filteredFinalRecommendations,
  },
  {
    upsert: true,
    new: true,
  }
);

res.json(filteredFinalRecommendations);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateRecommendationStatus = async (
  req,
  res
) => {
  try {
    const { userId, internshipId } = req.params;
    let { status } = req.body;
    const { title, company } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        message: "Invalid status value",
      });
    }

    const recommendationDoc =
      await Recommendation.findOne({
        user: userId,
      });

    if (!recommendationDoc) {
      return res.status(404).json({
        message: "Recommendations not found",
      });
    }

    let recommendation =
      recommendationDoc.recommendations.find(
        (item) =>
          String(item._id) === String(internshipId)
      );

    if (!recommendation && title && company) {
      recommendation =
        recommendationDoc.recommendations.find(
          (item) =>
            item.title === title &&
            item.company === company
        );
    }

    if (!recommendation) {
      return res.status(404).json({
        message: "Internship recommendation not found",
      });
    }

    const currentStatus =
      recommendation.status || "not viewed";

    // Avoid downgrading progress when Apply is clicked again.
    if (
      status === "viewed" &&
      TERMINAL_STATUSES.includes(currentStatus)
    ) {
      status = currentStatus;
    }

    recommendation.status = status;

    await recommendationDoc.save();

    res.json({
      message: "Status updated successfully",
      status: recommendation.status,
      internshipId,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getRecommendations,
  updateRecommendationStatus,
};