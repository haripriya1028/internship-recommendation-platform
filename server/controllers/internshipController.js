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

const deleteInternship = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);

    if (!internship) {
      return res.status(404).json({
        message: "Internship not found",
      });
    }

    await Internship.findByIdAndDelete(req.params.id);

    res.json({
      message: "Internship deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
const updateInternship = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);

    if (!internship) {
      return res.status(404).json({
        message: "Internship not found",
      });
    }

    internship.title = req.body.title;
    internship.company = req.body.company;
    internship.location = req.body.location;
    internship.skillsRequired = req.body.skillsRequired;
    internship.minimumCGPA = req.body.minimumCGPA;
    internship.eligibleBranches = req.body.eligibleBranches;
    internship.description = req.body.description;

    const updatedInternship = await internship.save();

    res.json(updatedInternship);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

console.log({
  createInternship,
  getInternships,
  deleteInternship,
});

module.exports = {
  createInternship,
  getInternships,
  deleteInternship,
  updateInternship, 
};