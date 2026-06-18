const Internship = require("../models/Internship");

const createInternship = async (req, res) => {
  try {
    const internship = await Internship.create(req.body);

    res.status(201).json(internship);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getInternships = async (req, res) => {
  try {
    const internships = await Internship.find();

    res.json(internships);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createInternship,
  getInternships,
};