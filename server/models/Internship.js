const mongoose = require("mongoose");

const internshipSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    company: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      default: "Remote",
    },

    skillsRequired: [
      {
        type: String,
      },
    ],

    minimumCGPA: {
      type: Number,
      default: 0,
    },

    eligibleBranches: [
      {
        type: String,
      },
    ],

    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Internship", internshipSchema);