const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/authorizeRoles");

const {
  getCompanyProfile,
  updateCompanyProfile,
  deleteCompanyProfile,
} = require("../controllers/companyController");

router.get("/", authMiddleware, authorizeRoles("company"), getCompanyProfile);
router.put("/", authMiddleware, authorizeRoles("company"), updateCompanyProfile);
router.delete("/", authMiddleware, authorizeRoles("company"), deleteCompanyProfile);

module.exports = router;