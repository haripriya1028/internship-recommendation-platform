const mongoose = require("mongoose");

const recommendationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
    },

    recommendations: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        title: String,
        company: String,
        location: String,
        description: String,
        skillsRequired: [String],
        minimumCGPA: Number,
        eligibleBranches: [String],
        matchedSkills: [String],
        ruleBasedScore: Number,
        score: Number,
        reason: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Recommendation",
  recommendationSchema
);