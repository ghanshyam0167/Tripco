const express = require("express");
const router  = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/authorizeRoles");

const {
  getCompanyProfile,
  updateCompanyProfile,
  deleteCompanyProfile,
  requestVerification,
} = require("../controllers/companyController");

router.get("/",    authMiddleware, authorizeRoles("COMPANY"), getCompanyProfile);
router.put("/",    authMiddleware, authorizeRoles("COMPANY"), updateCompanyProfile);
router.delete("/", authMiddleware, authorizeRoles("COMPANY"), deleteCompanyProfile);
router.post("/request-verification", authMiddleware, authorizeRoles("COMPANY"), requestVerification);

module.exports = router;