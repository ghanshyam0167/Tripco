const express = require("express");
const router  = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/authorizeRoles");

const {
  getTravelerProfile,
  updateTravelerProfile,
  deleteTravelerProfile,
} = require("../controllers/travelerController");

router.get("/",    authMiddleware, authorizeRoles("TRAVELER"), getTravelerProfile);
router.put("/",    authMiddleware, authorizeRoles("TRAVELER"), updateTravelerProfile);
router.delete("/", authMiddleware, authorizeRoles("TRAVELER"), deleteTravelerProfile);

module.exports = router;