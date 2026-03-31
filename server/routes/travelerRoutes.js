const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/authorizeRoles");

const {
  getTravelerProfile,
  updateTravelerProfile,
  deleteTravelerProfile,
} = require("../controllers/travelerController");

router.get("/", authMiddleware, authorizeRoles("traveler"), getTravelerProfile);
router.put("/", authMiddleware, authorizeRoles("traveler"), updateTravelerProfile);
router.delete("/", authMiddleware, authorizeRoles("traveler"), deleteTravelerProfile);

module.exports = router;