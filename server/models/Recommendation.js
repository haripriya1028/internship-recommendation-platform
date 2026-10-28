const mongoose = require("mongoose");

const recommendationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
    },

    // Set when internships or the profile change, so the next fetch
    // regenerates recommendations while keeping application statuses.
    stale: {
      type: Boolean,
      default: false,
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
        link: String,
        matchedSkills: [String],
        ruleBasedScore: Number,
        score: Number,
        reason: String,
        // false for internships tracked from Browse that weren't recommended
        recommended: {
          type: Boolean,
          default: true,
        },
        status: {
          type: String,
          enum: [
            "not viewed",
            "viewed",
            "applied",
            "in progress",
            "accepted",
            "rejected",
          ],
          default: "not viewed",
        },
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
