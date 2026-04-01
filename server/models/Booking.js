const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    // 👤 Traveler
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🧳 Trip
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
    },

    // 👥 Seats booked
    seatsBooked: {
      type: Number,
      required: true,
      min: 1,
    },

    // 💰 Total price
    totalPrice: {
      type: Number,
      required: true,
    },

    // 📊 Status
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },

    // 💳 Payment (future ready)
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;