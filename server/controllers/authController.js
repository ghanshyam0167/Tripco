const User = require("../models/User");
const { sendOTPEmail } = require("../services/emailService");

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

module.exports = { registerUser, verifyEmail, resendOTP, loginUser };