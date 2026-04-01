const express = require("express");
const router = express.Router();

const authMiddleware  = require("../middlewares/authMiddleware");
const authorizeRoles  = require("../middlewares/authorizeRoles");

const {
  createBooking,
  getMyBookings,
  cancelBooking,
  getCompanyBookings,
} = require("../controllers/bookingController");

// Traveler
router.post("/",           authMiddleware, authorizeRoles("TRAVELER"), createBooking);
router.get("/my",          authMiddleware, authorizeRoles("TRAVELER"), getMyBookings);
router.put("/cancel/:id",  authMiddleware, authorizeRoles("TRAVELER"), cancelBooking);

// Company
router.get("/company",     authMiddleware, authorizeRoles("COMPANY"),  getCompanyBookings);

module.exports = router;