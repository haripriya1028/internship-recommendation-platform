const express = require("express");

const router = express.Router();

const {
  getRecommendations,
  updateRecommendationStatus,
} = require("../controllers/recommendationController");

const { authenticateUser } = require("../middleware/authMiddleware");

router.get("/:userId", authenticateUser, getRecommendations);

router.patch(
  "/:userId/:internshipId/status",
  authenticateUser,
  updateRecommendationStatus
);

module.exports = router;
