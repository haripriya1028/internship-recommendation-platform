const express = require("express");

const router = express.Router();

const {
  createProfile,
  getProfile,
  updateProfile,
} = require("../controllers/profileController");

const { authenticateUser } = require("../middleware/authMiddleware");

router.post("/", authenticateUser, createProfile);

router.get("/:userId", authenticateUser, getProfile);

router.put("/:userId", authenticateUser, updateProfile);

module.exports = router;