const express = require("express");

const router = express.Router();

const {
  getRecommendations,
  updateRecommendationStatus,
} = require("../controllers/recommendationController");

router.get("/:userId", getRecommendations);
router.patch(
  "/:userId/:internshipId/status",
  updateRecommendationStatus
);

module.exports = router;