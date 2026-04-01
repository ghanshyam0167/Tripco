const mongoose = require("mongoose");
const { randomBytes, createHmac } = require("crypto");
const { createTokenForUser } = require("../services/authentication");

// 👤 User Schema
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    salt: {
      type: String,
    },

    role: {
      type: String,
      enum: ["TRAVELER", "COMPANY", "ADMIN"],
      default: "TRAVELER",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    resetOTP: String,
    resetOTPExpiry: Date,
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  const user = this;

  if (!user.isModified("password")) return;

  const salt = randomBytes(16).toString("hex");

  const hashedPassword = createHmac("sha256", salt)
    .update(user.password)
    .digest("hex");

  user.salt = salt;
  user.password = hashedPassword;
});

userSchema.statics.matchPasswordAndGenerateToken = async function (
  email,
  password
) {
  const user = await this.findOne({ email });

  if (!user) throw new Error("User not found");

  const salt = user.salt;
  const hashedPassword = user.password;

  const userProvidedHash = createHmac("sha256", salt)
    .update(password)
    .digest("hex");

  if (hashedPassword !== userProvidedHash) {
    throw new Error("Incorrect Password");
  }

  // 🔥 Generate JWT
  const token = createTokenForUser(user);

  return {
    token,
    user: {
      _id: user._id,
      email: user.email,
      role: user.role.toUpperCase(),
    },
  };
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.salt;
  return obj;
};


const User = mongoose.model("User", userSchema);

module.exports = User;
