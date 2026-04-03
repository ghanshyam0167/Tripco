const User = require("../models/User");
const { sendOTPEmail, sendPasswordResetEmail } = require("../services/emailService");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/** Generate a 6-digit OTP */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ─── Register ──────────────────────────────────────────────────────────────
const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const role = req.body.role === "COMPANY" ? "COMPANY" : "TRAVELER";

    if (!email || !password)
      return res.status(400).json({ message: "All fields are required" });

    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    // Create just the user — profile is created later during profile completion step
    const user = await User.create({
      email,
      password,
      role,
      emailOTP: otp,
      emailOTPExpiry: otpExpiry,
      isEmailVerified: false,
    });

    // Send OTP (non-blocking)
    sendOTPEmail(email, otp).catch((err) =>
      console.error("OTP send failed:", err.message)
    );

    return res.status(201).json({
      message: "Registration successful. Please check your email for a verification code.",
      userId: user._id,
      email: user.email,
    });
  } catch (error) {
    return res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

// ─── Verify Email ──────────────────────────────────────────────────────────
const verifyEmail = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    if (!userId || !otp)
      return res.status(400).json({ message: "userId and otp are required" });

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    if (user.isEmailVerified)
      return res.status(400).json({ message: "Email already verified" });

    if (!user.emailOTP || user.emailOTP !== otp)
      return res.status(400).json({ message: "Invalid verification code" });

    if (user.emailOTPExpiry < new Date())
      return res.status(400).json({ message: "Verification code expired. Please request a new one." });

    // Mark verified + clear OTP
    user.isEmailVerified = true;
    user.emailOTP = undefined;
    user.emailOTPExpiry = undefined;
    await user.save();

    // Return JWT so the user can proceed to profile completion
    const { createTokenForUser } = require("../services/authentication");
    const token = createTokenForUser(user);

    return res.status(200).json({
      message: "Email verified successfully",
      token,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Verification failed", error: error.message });
  }
};

// ─── Resend OTP ────────────────────────────────────────────────────────────
const resendOTP = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId)
      return res.status(400).json({ message: "userId is required" });

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    if (user.isEmailVerified)
      return res.status(400).json({ message: "Email already verified" });

    const otp = generateOTP();
    user.emailOTP = otp;
    user.emailOTPExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    sendOTPEmail(user.email, otp).catch((err) =>
      console.error("OTP resend failed:", err.message)
    );

    return res.status(200).json({ message: "A new verification code has been sent to your email." });
  } catch (error) {
    return res.status(500).json({ message: "Resend failed", error: error.message });
  }
};

// ─── Login ─────────────────────────────────────────────────────────────────
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const result = await User.matchPasswordAndGenerateToken(email, password);

    return res.status(200).json({
      message: "Login successful",
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    if (error.code === "EMAIL_NOT_VERIFIED") {
      return res.status(403).json({
        message: error.message,
        code: "EMAIL_NOT_VERIFIED",
        userId: error.userId,
        email: error.email,
      });
    }
    return res.status(401).json({ message: error.message || "Login failed" });
  }
};

// ─── Forgot Password ───────────────────────────────────────────────────────
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No account found with this email address." });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Hash OTP before saving
    const salt = await bcrypt.genSalt(10);
    const hashedOTP = await bcrypt.hash(otp, salt);

    user.resetOTP = hashedOTP;
    user.resetOTPExpiry = otpExpiry;
    await user.save();

    sendPasswordResetEmail(user.email, otp).catch((err) => 
      console.error("Password reset email failed:", err.message)
    );

    return res.status(200).json({ message: "Reset code sent successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Request failed", error: error.message });
  }
};

// ─── Verify Reset OTP ──────────────────────────────────────────────────────
const verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

    const user = await User.findOne({ email });
    if (!user || !user.resetOTP) return res.status(400).json({ message: "Invalid or expired OTP" });

    if (user.resetOTPExpiry < new Date()) {
      user.resetOTP = undefined;
      user.resetOTPExpiry = undefined;
      await user.save();
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    const isValidOTP = await bcrypt.compare(otp, user.resetOTP);
    if (!isValidOTP) return res.status(400).json({ message: "Invalid or expired OTP" });

    // Generate a temporary token to authorize the password reset step
    const resetToken = jwt.sign(
      { userId: user._id, purpose: "reset_password" },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "15m" }
    );

    // Optionally we can clear the OTP here, but maybe we keep it until password is fully reset, 
    // or just clear it now since we issued a resetToken.
    user.resetOTP = undefined;
    user.resetOTPExpiry = undefined;
    await user.save();

    return res.status(200).json({ message: "OTP verified correctly", resetToken });
  } catch (error) {
    return res.status(500).json({ message: "Verification failed", error: error.message });
  }
};

// ─── Reset Password ────────────────────────────────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;
    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET || "fallback_secret");
    } catch (err) {
      return res.status(400).json({ message: "Invalid or expired reset token. Please restart the process." });
    }

    if (decoded.purpose !== "reset_password") {
      return res.status(400).json({ message: "Invalid token purpose" });
    }

    const user = await User.findById(decoded.userId);
    if (!user || user.email !== email) {
      return res.status(400).json({ message: "Invalid request" });
    }

    // Update password (pre-save hook in schema will hash it again)
    user.password = newPassword;
    await user.save();

    return res.status(200).json({ message: "Password has been successfully reset. You can now log in." });
  } catch (error) {
    return res.status(500).json({ message: "Password reset failed", error: error.message });
  }
};

module.exports = { registerUser, verifyEmail, resendOTP, loginUser, forgotPassword, verifyResetOTP, resetPassword };