const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  branch: {
    type: String
  },

  year: {
    type: Number
  },

  skills: [
    {
      type: String
    }
  ]
});

module.exports = mongoose.model("User", userSchema);