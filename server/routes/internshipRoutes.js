const express = require("express");

const router = express.Router();

const {
  createInternship,
  getInternships,
  deleteInternship,
  updateInternship,
} = require("../controllers/internshipController");

const { isAdmin } = require("../middleware/adminMiddleware");
const { authenticateUser } = require("../middleware/authMiddleware");

console.log("authenticateUser:", authenticateUser);
console.log("isAdmin:", isAdmin);
console.log("deleteInternship:", deleteInternship);

router.post("/", authenticateUser, isAdmin, createInternship);

router.get("/", getInternships);

router.delete(
  "/:id",
  authenticateUser,
  isAdmin,
  deleteInternship
);
router.put(
  "/:id",
  authenticateUser,
  isAdmin,
  updateInternship
);

module.exports = router;