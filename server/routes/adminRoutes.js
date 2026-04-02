const express = require("express");
const router  = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/authorizeRoles");

const {
  getStats,
  getAllUsers,
  toggleUserActive,
  deleteUser,
  getPendingCompanies,
  getAllCompanies,
  approveCompany,
  rejectCompany,
  getRecentBookings,
} = require("../controllers/adminController");

const guard = [authMiddleware, authorizeRoles("ADMIN")];

router.get("/stats",               ...guard, getStats);
router.get("/users",               ...guard, getAllUsers);
router.patch("/users/:id/toggle",  ...guard, toggleUserActive);
router.delete("/users/:id",        ...guard, deleteUser);
router.get("/companies",           ...guard, getAllCompanies);
router.get("/companies/pending",   ...guard, getPendingCompanies);
router.patch("/companies/:id/approve", ...guard, approveCompany);
router.patch("/companies/:id/reject",  ...guard, rejectCompany);
router.get("/bookings/recent",     ...guard, getRecentBookings);

module.exports = router;
