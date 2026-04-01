const Booking = require("../models/Booking");
const Trip = require("../models/Trip");
const TravelerProfile = require("../models/TravelerProfile");


// 🎟️ CREATE BOOKING (Traveler)
const createBooking = async (req, res) => {
  try {
    const userId = req.user._id;
    const { tripId, seatsBooked } = req.body;

    // 1️⃣ Find trip
    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    // 2️⃣ Check seat availability
    if (trip.availableSeats < seatsBooked) {
      return res.status(400).json({ message: "Not enough seats available" });
    }

    // 3️⃣ Calculate price
    const totalPrice = seatsBooked * (trip.discountPrice || trip.price);

    // 4️⃣ Create booking
    const booking = await Booking.create({
      userId,
      tripId,
      seatsBooked,
      totalPrice,
      status: "confirmed",
      paymentStatus: "pending",
    });

    // 5️⃣ Update seats
    trip.availableSeats -= seatsBooked;
    await trip.save();

    // 6️⃣ Add booking to traveler profile
    await TravelerProfile.findOneAndUpdate(
      { userId },
      { $push: { bookings: booking._id } }
    );

    res.status(201).json({
      message: "Booking successful",
      booking,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// 📋 GET MY BOOKINGS (Traveler)
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate("tripId");

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// ❌ CANCEL BOOKING
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // 🔐 ownership check
    if (booking.userId.toString() !== req.user._id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // already cancelled
    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Already cancelled" });
    }

    // 1️⃣ update status
    booking.status = "cancelled";
    await booking.save();

    // 2️⃣ restore seats
    const trip = await Trip.findById(booking.tripId);
    trip.availableSeats += booking.seatsBooked;
    await trip.save();

    res.json({ message: "Booking cancelled successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// 🏢 COMPANY: VIEW BOOKINGS FOR THEIR TRIPS
const getCompanyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate({
        path: "tripId",
        match: { companyId: req.user._id },
      })
      .populate("userId", "email");

    // filter out null trips
    const filtered = bookings.filter(b => b.tripId !== null);

    res.json(filtered);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



module.exports = {
  createBooking,
  getMyBookings,
  cancelBooking,
  getCompanyBookings,
};