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
      required: true,
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
      required: true,
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
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

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