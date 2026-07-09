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

// ===================== INDEXES =====================

// Faster search by company
internshipSchema.index({ company: 1 });

// Faster search by internship title
internshipSchema.index({ title: 1 });

// Faster filtering by CGPA
internshipSchema.index({ minimumCGPA: 1 });

// ===================================================

module.exports = mongoose.model("Internship", internshipSchema);