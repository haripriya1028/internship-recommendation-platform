const express = require("express");

const router = express.Router();

const {
  createInternship,
  getInternships,
} = require("../controllers/internshipController");

router.post("/", createInternship);

router.get("/", getInternships);

module.exports = router;