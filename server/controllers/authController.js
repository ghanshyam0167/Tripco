const User = require("../models/User");
const CompanyProfile = require("../models/CompanyProfile")
const TravelerProfile = require("../models/TravelerProfile")

const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔐 role control
    const role = req.body.role === "company" ? "company" : "traveler";

    // 1️⃣ Validation
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    // 2️⃣ Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const session = await User.startSession();
    session.startTransaction();

    try {
      const user = await User.create([{ email, password, role }], { session });

      if (role === "traveler") {
        await TravelerProfile.create(
          [{ userId: user[0]._id, fullName: "New User" }],
          { session }
        );
      } else {
        await CompanyProfile.create(
          [{
            userId: user[0]._id,
            companyName: "New Company",
            contactEmail: user[0].email,
          }],
          { session }
        );
      }

      await session.commitTransaction();
      session.endSession();

      // 🔐 remove sensitive data
      const userObj = user[0].toObject();
      delete userObj.password;
      delete userObj.salt;

      return res.status(201).json({
        message: "User registered successfully",
        user: userObj,
      });

    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      return res.status(500).json({
        message: "Registration failed",
        error: error.message,
      });
    }

  } catch (error) {
    return res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
};


const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // 2️⃣ Use model method (your custom crypto logic)
    const result = await User.matchPasswordAndGenerateToken(
      email,
      password
    );

    return res.status(200).json({
      message: "Login successful",
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    return res.status(401).json({
      message: error.message || "Login failed",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
};