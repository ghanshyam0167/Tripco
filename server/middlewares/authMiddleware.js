const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 1️⃣ Check token
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Unauthorized: No token provided",
      });
    }

    // 2️⃣ Extract token
    const token = authHeader.split(" ")[1];

    // 3️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4️⃣ Ensure user exists in DB and is active
    const user = await User.findById(decoded._id);
    if (!user) {
      return res.status(401).json({
        message: "Unauthorized: User account has been deleted",
      });
    }
    if (!user.isActive) {
      return res.status(401).json({
        message: "Unauthorized: User account has been suspended",
      });
    }

    // 5️⃣ Attach user
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized: Invalid token",
    });
  }
};

module.exports = authMiddleware;