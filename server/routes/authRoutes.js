const express = require("express");
const router  = express.Router();

const {
  registerUser,
  verifyEmail,
  resendOTP,
  loginUser,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
} = require("../controllers/authController");

router.post("/register",         registerUser);
router.post("/verify-email",     verifyEmail);
router.post("/resend-otp",       resendOTP);
router.post("/login",            loginUser);

router.post("/forgot-password",  forgotPassword);
router.post("/verify-otp",       verifyResetOTP);
router.post("/reset-password",   resetPassword);

module.exports = router;