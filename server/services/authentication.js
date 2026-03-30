const jwt = require("jsonwebtoken");

function createTokenForUser(user) {
  return jwt.sign(
    {
      _id: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function validateToken(token) {
    const payload = JWT.verify(token, secret_key)
    return payload
}

module.exports = { createTokenForUser, validateToken};