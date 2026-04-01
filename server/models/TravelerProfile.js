const mongoose = require("mongoose");

const travelerProfileSchema = new mongoose.Schema(
  {
    // 🔗 Link to User
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // 👤 PERSONAL DETAILS
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
    },

    age: {
      type: Number,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },

    location: {
      city: String,
      state: String,
      country: String,
    },

    profileImage: {
      type: String, // URL (Supabase / Cloudinary later)
    },

    bio: {
      type: String,
    },

    // 🎯 TRAVEL PREFERENCES
    preferences: {
      budget: {
        type: Number,
        default: 0,
      },

      interests: {
        type: [String], // ["adventure", "beach"]
        default: [],
      },

      travelStyle: {
        type: String,
        enum: ["budget", "luxury", "backpacking", "family"],
        default: "budget",
      },

      preferredDestinations: {
        type: [String],
        default: [],
      },

      travelFrequency: {
        type: String, // rare | occasional | frequent
        enum: ["rare", "occasional", "frequent"],
      },
    },

    // ❤️ USER ACTIVITY
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Trip",
      },
    ],

    bookings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
      },
    ],

    // ⭐ SYSTEM DATA
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const TravelerProfile = mongoose.model(
  "TravelerProfile",
  travelerProfileSchema
);

module.exports = TravelerProfile;