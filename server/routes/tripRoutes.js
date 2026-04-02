const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/authorizeRoles");


const {
  createTrip,
  getAllTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  searchTrips,
} = require("../controllers/tripController");

// Public
router.get("/",        getAllTrips);
router.get("/search",  searchTrips);
router.get("/:id",     getTripById);

// Protected (Company only)
router.post("/",       authMiddleware, authorizeRoles("COMPANY"), createTrip);
router.put("/:id",     authMiddleware, authorizeRoles("COMPANY"), updateTrip);
router.delete("/:id",  authMiddleware, authorizeRoles("COMPANY"), deleteTrip);

module.exports = router;