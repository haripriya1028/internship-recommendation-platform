const Profile = require("../models/Profile");
const Recommendation = require("../models/Recommendation");

// A user may only touch their own profile unless they're an admin.
const isSelfOrAdmin = (req, targetUserId) =>
  req.user.role === "admin" || req.user.id === targetUserId;

const createProfile = async (req, res) => {
  try {
    // Force the profile to be created for the authenticated user,
    // never for whatever "user" the client puts in the body.
    if (!isSelfOrAdmin(req, req.body.user)) {
      return res.status(403).json({
        message: "Not authorized to create this profile",
      });
    }

    const profile = await Profile.create(req.body);

    res.status(201).json(profile);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getProfile = async (req, res) => {
  try {
    if (!isSelfOrAdmin(req, req.params.userId)) {
      return res.status(403).json({
        message: "Not authorized to view this profile",
      });
    }

    const profile = await Profile.findOne({
      user: req.params.userId,
    });

    if (!profile) {
      return res.status(404).json({
        message: "Profile not found",
      });
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
const updateProfile = async (req, res) => {
  try {
    if (!isSelfOrAdmin(req, req.params.userId)) {
      return res.status(403).json({
        message: "Not authorized to update this profile",
      });
    }

    const profile = await Profile.findOneAndUpdate(
      { user: req.params.userId },
      req.body,
      {
        new: true,
      }
    );

    if (!profile) {
      return res.status(404).json({
        message: "Profile not found",
      });
    }

    // Delete cached recommendations
    await Recommendation.deleteOne({
      user: req.params.userId,
    });

res.json(profile);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
module.exports = {
  createProfile,
  getProfile,
  updateProfile
};