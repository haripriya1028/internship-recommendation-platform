const Profile = require("../models/Profile");
const Internship = require("../models/Internship");

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

    const recommendations = internships.map((internship) => {
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

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getRecommendations,
};