const express = require("express");

const router = express.Router();

const {
  getRecommendations,
} = require("../controllers/recommendationController");

const { authenticateUser } = require("../middleware/authMiddleware");

router.get("/:userId", authenticateUser, getRecommendations);

module.exports = router;