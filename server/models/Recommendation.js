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
        link: String,
        score: Number,
        reason: String,
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