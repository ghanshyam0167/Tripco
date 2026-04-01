const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
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

    // 4️⃣ Attach user
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized: Invalid token",
    });
  }
};

module.exports = authMiddleware;