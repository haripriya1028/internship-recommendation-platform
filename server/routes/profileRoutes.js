const express = require("express");

const router = express.Router();




const {
  createProfile,
  getProfile,
  updateProfile,
} = require("../controllers/profileController");

router.post("/", createProfile);

router.get("/:userId", getProfile);

router.put("/:userId", updateProfile);
module.exports = router;