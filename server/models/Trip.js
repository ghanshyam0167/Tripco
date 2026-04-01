const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    // 🏢 Company who created trip
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    companyProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompanyProfile",
      required: true,
    },

    // 🧳 BASIC INFO
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
    },

    destination: {
      city: String,
      state: String,
      country: String,
    },

    // 📅 DURATION
    duration: {
      days: {
        type: Number,
        required: true,
      },
      nights: {
        type: Number,
      },
    },

    startDate: {
      type: Date,
    },

    endDate: {
      type: Date,
    },

    // 💰 PRICING
    price: {
      type: Number,
      required: true,
    },

    discountPrice: {
      type: Number,
    },

    // 👥 CAPACITY
    totalSeats: {
      type: Number,
      required: true,
    },

    availableSeats: {
      type: Number,
      required: true,
    },

    // 🗺️ ITINERARY (IMPORTANT 🔥)
    itinerary: [
      {
        day: Number,
        title: String,
        description: String,
        activities: [String],
      },
    ],

    // 🏷️ TAGS FOR AI MATCHING
    tags: {
      type: [String], // ["adventure", "beach"]
      default: [],
    },

    travelStyle: {
      type: String,
      enum: ["budget", "luxury", "backpacking", "family"],
    },

    // 🖼️ MEDIA
    images: {
      type: [String], // URLs
      default: [],
    },

    // ⭐ RATINGS
    rating: {
      type: Number,
      default: 0,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    // 📊 STATUS
    status: {
      type: String,
      enum: ["active", "inactive", "completed"],
      default: "active",
    },

    // 🧾 BOOKINGS
    bookings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
      },
    ],
  },
  { timestamps: true }
);

const Trip = mongoose.model("Trip", tripSchema);

module.exports = Trip;