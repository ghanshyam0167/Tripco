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

    origin: {
      location: String,
    },

    destination: {
      city: String,
      state: String,
      country: String,
    },

    transport: {
      modeType: { type: String, enum: ["same", "multiple"] },
      sameVehicle: {
        from: String,
        to: String,
        vehicleType: { type: String, enum: ["Bus", "Train", "Flight", "Car"] },
        // Bus
        busType: String,
        busNumber: String,
        // Train
        trainNumber: String,
        coachType: String,
        // Flight
        flightNumber: String,
        flightClass: String,
        // Car
        carType: String,
        acNonAc: String,
      },
      multipleVehicles: [
        {
          day: Number,
          from: String,
          to: String,
          vehicleType: { type: String, enum: ["Bus", "Train", "Flight", "Car", "Other"] },
          // Bus
          busType: String,
          busNumber: String,
          // Train
          trainNumber: String,
          coachType: String,
          // Flight
          flightNumber: String,
          flightClass: String,
          // Car
          carType: String,
          acNonAc: String,
          // Generic
          details: String,
        }
      ]
    },

    // 🏨 ACCOMMODATION (STAY)
    stay: {
      type: {
         type: String,
         enum: ["same", "perDay"],
         default: "same",
      },
      details: [
        {
          day: Number, // Only relevant if 'perDay'
          hotelName: String,
          location: String,
          roomType: { type: String, enum: ["Single", "Double", "Deluxe", "Suite"] },
          mealPlan: { type: String, enum: ["Room Only", "Breakfast", "Half Board", "Full Board"] },
          amenities: [String],
          checkIn: String,
          checkOut: String
        }
      ]
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
        nightActivity: {
          isIncluded: { type: Boolean, default: false },
          title: String,
          description: String,
        }
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
      enum: ["active", "inactive", "draft", "completed"],
      default: "active",
    },

    // 👷 SUPERVISORS
    supervisors: [
      {
        name: String,
        phone: String,
        email: String,
        role: String,
        experience: Number,
        idProof: String,
      }
    ],

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