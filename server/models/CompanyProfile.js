const mongoose = require("mongoose");

const companyProfileSchema = new mongoose.Schema(
  {
    // 🔗 Link to User
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // 🏢 COMPANY BASIC DETAILS
    companyName: {
      type: String,
      trim: true,
    },

    companyLogo: {
      type: String, // URL (Cloudinary/Supabase later)
    },

    description: {
      type: String,
    },

    // 📍 LOCATION DETAILS
    location: {
      address: String,
      city: String,
      state: String,
      country: String,
    },

    // 📞 CONTACT DETAILS
    contactEmail: {
      type: String,
    },

    contactPhone: {
      type: String,
    },

    website: {
      type: String,
    },

    // 📄 BUSINESS INFO
    registrationNumber: {
      type: String, // Govt/business registration
    },

    establishedYear: {
      type: Number,
    },

    // ✅ VERIFICATION SYSTEM (IMPORTANT 🔥)
    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationStatus: {
      type: String,
      enum: ["unverified", "pending", "approved", "rejected"],
      default: "unverified",
    },

    verificationMessage: {
      type: String, // Reason for rejection or approval note
    },

    verificationHistory: [
      {
        status: { type: String, enum: ["pending", "approved", "rejected"] },
        reason: String, // optional depending on admin input
        updatedAt: { type: Date, default: Date.now },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Action taken by (admin)
      },
    ],

    // 📊 PERFORMANCE / ANALYTICS
    rating: {
      type: Number,
      default: 0,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    totalTrips: {
      type: Number,
      default: 0,
    },

    totalBookings: {
      type: Number,
      default: 0,
    },

    // 🎯 BUSINESS SETTINGS
    servicesOffered: {
      type: [String], // ["adventure", "luxury", "honeymoon"]
      default: [],
    },

    priceRange: {
      min: Number,
      max: Number,
    },

    // 🧾 TRIPS CREATED BY COMPANY
    trips: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Trip",
      },
    ],

    // ⭐ REVIEWS RECEIVED
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  { timestamps: true }
);

const CompanyProfile = mongoose.model(
  "CompanyProfile",
  companyProfileSchema
);

module.exports = CompanyProfile;