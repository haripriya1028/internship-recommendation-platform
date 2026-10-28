const Recommendation = require("../models/Recommendation");
const Profile = require("../models/Profile");
const Internship = require("../models/Internship");
const {
  recommendInternships,
} = require("../services/geminiService");

const VALID_STATUSES = [
  "not viewed",
  "viewed",
  "applied",
  "in progress",
  "accepted",
  "rejected",
];

const TERMINAL_STATUSES = [
  "applied",
  "in progress",
  "accepted",
  "rejected",
];

const MIN_RECOMMENDATION_SCORE = 50;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const SHORTLIST_SIZE = 15;

// A user may only touch their own recommendations unless they're an admin.
const isSelfOrAdmin = (req, targetUserId) =>
  req.user.role === "admin" || req.user.id === targetUserId;

const isTracked = (recommendation) =>
  (recommendation.status || "not viewed") !== "not viewed";

// ---- Stage 1: rule-based scoring (fast, deterministic recall) ----
const scoreInternships = (profile, internships) => {
  const profileSkills = (profile.skills || []).map((s) =>
    s.toLowerCase()
  );
  const interests = (profile.interests || []).map((i) =>
    i.toLowerCase()
  );

  return internships
    .map((internship) => {
      const requiredSkills = internship.skillsRequired || [];
      const matchedSkills = requiredSkills.filter((skill) =>
        profileSkills.includes(skill.toLowerCase())
      );

      let score = 0;

      // Skill Match (60 points)
      if (requiredSkills.length > 0) {
        score += (matchedSkills.length / requiredSkills.length) * 60;
      }

      // Branch Match (20 points)
      if (internship.eligibleBranches?.includes(profile.branch)) {
        score += 20;
      }

      // CGPA Match (20 points)
      if (profile.cgpa >= internship.minimumCGPA) {
        score += 20;
      }

      // Interest alignment bonus (10 points)
      const textToCheck = `${internship.title || ""} ${
        internship.description || ""
      }`.toLowerCase();
      const matchedInterests = interests.filter((interest) =>
        textToCheck.includes(interest)
      );

      if (matchedInterests.length > 0) {
        score += 10;
      }

      return {
        _id: internship._id,
        title: internship.title,
        company: internship.company,
        location: internship.location,
        description: internship.description,
        skillsRequired: internship.skillsRequired,
        minimumCGPA: internship.minimumCGPA,
        eligibleBranches: internship.eligibleBranches,
        link: internship.link || "",
        matchedSkills,
        matchedInterests,
        matchScore: Math.min(100, Math.round(score)),
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
};

// Used when Gemini is unavailable or returns nothing usable.
const buildFallbackRecommendations = (shortlist) =>
  shortlist.map((internship) => ({
    id: internship._id.toString(),
    score: internship.matchScore,
    reason: `Matched ${internship.matchedSkills.length}/${
      (internship.skillsRequired || []).length
    } required skills, branch and CGPA eligibility considered${
      internship.matchedInterests.length > 0
        ? ", plus interest alignment"
        : ""
    }.`,
  }));

const toTrackedEntry = (internship, status) => ({
  _id: internship._id,
  title: internship.title,
  company: internship.company,
  location: internship.location,
  description: internship.description,
  skillsRequired: internship.skillsRequired,
  minimumCGPA: internship.minimumCGPA,
  eligibleBranches: internship.eligibleBranches,
  link: internship.link || "",
  recommended: false,
  status,
});

const getRecommendations = async (req, res) => {
  try {
    if (!isSelfOrAdmin(req, req.params.userId)) {
      return res.status(403).json({
        message: "Not authorized to view these recommendations",
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

    const internships = await Internship.find();
    const internshipsById = new Map(
      internships.map((internship) => [
        internship._id.toString(),
        internship,
      ])
    );

    const cachedRecommendations = await Recommendation.findOne({
      user: req.params.userId,
    });

    const isCacheFresh =
      cachedRecommendations &&
      !cachedRecommendations.stale &&
      Date.now() - cachedRecommendations.updatedAt.getTime() <
        CACHE_TTL_MS;

    if (isCacheFresh) {
      // Backfill links/statuses on entries cached before those fields existed.
      const normalizedRecommendations =
        cachedRecommendations.recommendations.map((recommendation) => ({
          ...recommendation.toObject(),
          link:
            recommendation.link ||
            internshipsById.get(String(recommendation._id))?.link ||
            "",
          status: recommendation.status || "not viewed",
        }));

      const hasMissingData =
        cachedRecommendations.recommendations.some(
          (recommendation) =>
            !recommendation.status ||
            recommendation.link === undefined
        );

      if (hasMissingData) {
        await Recommendation.updateOne(
          { _id: cachedRecommendations._id },
          { recommendations: normalizedRecommendations },
          { timestamps: false }
        );
      }

      console.log("Serving recommendations from cache");
      return res.json(normalizedRecommendations);
    }

    const scored = scoreInternships(profile, internships);

    // Shortlist the top candidates so we're not shipping the entire
    // internship collection into every Gemini call.
    const shortlist = scored.slice(0, SHORTLIST_SIZE);

    // ---- Stage 2: LLM re-ranking + reasoning on the shortlist only ----
    let aiRecommendations;

    try {
      aiRecommendations = await recommendInternships(profile, shortlist);
    } catch (error) {
      console.error(
        "Gemini recommendation failed, using fallback:",
        error.message
      );
    }

    const rankedRecommendations = Array.isArray(aiRecommendations)
      ? aiRecommendations
      : aiRecommendations?.recommendations || [];

    const safeRecommendations =
      rankedRecommendations.length > 0
        ? rankedRecommendations
        : buildFallbackRecommendations(shortlist);

    // Carry over application statuses from the previous cache so a refresh
    // never wipes the user's Applications.
    const previousStatuses = new Map(
      (cachedRecommendations?.recommendations || []).map(
        (recommendation) => [
          String(recommendation._id),
          recommendation.status || "not viewed",
        ]
      )
    );

    // Merge Gemini's output back onto the shortlist by stable _id
    // (never by title/company text, which breaks if the model paraphrases).
    const shortlistById = new Map(
      shortlist.map((internship) => [internship._id.toString(), internship])
    );

    const finalRecommendations = safeRecommendations
      .map((aiInternship) => {
        const original = shortlistById.get(String(aiInternship.id));
        if (!original) return null;

        return {
          _id: original._id,
          title: original.title,
          company: original.company,
          location: original.location,
          description: original.description,
          skillsRequired: original.skillsRequired,
          minimumCGPA: original.minimumCGPA,
          eligibleBranches: original.eligibleBranches,
          link: original.link,
          matchedSkills: original.matchedSkills,
          ruleBasedScore: original.matchScore,
          score: aiInternship.score,
          reason: aiInternship.reason,
          recommended: true,
          status:
            previousStatuses.get(String(original._id)) || "not viewed",
        };
      })
      .filter(
        (recommendation) =>
          recommendation &&
          (Number(recommendation.score || 0) >=
            MIN_RECOMMENDATION_SCORE ||
            isTracked(recommendation))
      )
      .sort((a, b) => b.score - a.score);

    // Keep tracked applications that dropped out of the new recommendations.
    const finalIds = new Set(
      finalRecommendations.map((recommendation) =>
        String(recommendation._id)
      )
    );

    const carriedOverApplications = (
      cachedRecommendations?.recommendations || []
    )
      .filter(
        (recommendation) =>
          isTracked(recommendation) &&
          !finalIds.has(String(recommendation._id))
      )
      .map((recommendation) => ({
        ...recommendation.toObject(),
        recommended: false,
      }));

    const allRecommendations = [
      ...finalRecommendations,
      ...carriedOverApplications,
    ];

    await Recommendation.findOneAndUpdate(
      {
        user: req.params.userId,
      },
      {
        recommendations: allRecommendations,
        stale: false,
      },
      {
        upsert: true,
        new: true,
      }
    );

    res.json(allRecommendations);
  } catch (error) {
    console.error("getRecommendations failed:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateRecommendationStatus = async (req, res) => {
  try {
    const { userId, internshipId } = req.params;
    let { status } = req.body;
    const { title, company } = req.body;

    if (!isSelfOrAdmin(req, userId)) {
      return res.status(403).json({
        message: "Not authorized to update these applications",
      });
    }

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        message: "Invalid status value",
      });
    }

    let recommendationDoc = await Recommendation.findOne({
      user: userId,
    });

    let recommendation = recommendationDoc?.recommendations.find(
      (item) => String(item._id) === String(internshipId)
    );

    if (!recommendation && recommendationDoc && title && company) {
      recommendation = recommendationDoc.recommendations.find(
        (item) => item.title === title && item.company === company
      );
    }

    // Internships opened from Browse may not be in the user's
    // recommendations yet, so start tracking them here.
    if (!recommendation) {
      if (status === "not viewed") {
        return res.json({
          message: "Status updated successfully",
          status,
          internshipId,
        });
      }

      const internship = await Internship.findById(internshipId);

      if (!internship) {
        return res.status(404).json({
          message: "Internship not found",
        });
      }

      if (!recommendationDoc) {
        // Mark stale so the first Recommendations visit still generates
        // real recommendations instead of serving only this entry.
        recommendationDoc = new Recommendation({
          user: userId,
          stale: true,
          recommendations: [],
        });
      }

      recommendationDoc.recommendations.push(
        toTrackedEntry(internship, "not viewed")
      );
      recommendation =
        recommendationDoc.recommendations[
          recommendationDoc.recommendations.length - 1
        ];
    }

    const currentStatus = recommendation.status || "not viewed";

    // Avoid downgrading progress when Apply is clicked again.
    if (
      status === "viewed" &&
      TERMINAL_STATUSES.includes(currentStatus)
    ) {
      status = currentStatus;
    }

    recommendation.status = status;

    // Status changes shouldn't reset the 24h recommendation cache timer.
    await recommendationDoc.save({ timestamps: false });

    res.json({
      message: "Status updated successfully",
      status: recommendation.status,
      internshipId,
    });
  } catch (error) {
    console.error("updateRecommendationStatus failed:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getRecommendations,
  updateRecommendationStatus,
};
