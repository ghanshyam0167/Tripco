const jwt = require("jsonwebtoken");

function createTokenForUser(user) {
  return jwt.sign(
    {
      _id: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

function validateToken(token) {
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  return payload;
}

module.exports = { createTokenForUser, validateToken };