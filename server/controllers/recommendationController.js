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
    const cachedRecommendations =
      await Recommendation.findOne({
        user: req.params.userId,
    }); 
    

if (cachedRecommendations) {

  console.log("Serving recommendations from cache");

  return res.json(
    cachedRecommendations.recommendations
  );

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
    // Ask Gemini to rank internships
const aiRecommendations = await recommendInternships(
  profile,
  internships
);

// Merge Gemini results with MongoDB internship details
const finalRecommendations = aiRecommendations.map((aiInternship) => {

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

    score: aiInternship.score,
    reason: aiInternship.reason,
  };

}).filter(Boolean);

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
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getRecommendations,
};