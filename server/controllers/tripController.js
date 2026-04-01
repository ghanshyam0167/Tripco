const Trip = require("../models/Trip");
const CompanyProfile = require("../models/CompanyProfile");


// 🏢 CREATE TRIP (Company only)
const createTrip = async (req, res) => {
  try {
    const userId = req.user._id;

    // 🔍 find company profile
    const companyProfile = await CompanyProfile.findOne({ userId });

    if (!companyProfile) {
      return res.status(404).json({ message: "Company profile not found" });
    }

    const tripData = {
      ...req.body,
      companyId: userId,
      companyProfileId: companyProfile._id,
      availableSeats: req.body.totalSeats, // initially equal
    };

    const trip = await Trip.create(tripData);

    // optional: update company stats
    companyProfile.totalTrips += 1;
    await companyProfile.save();

    res.status(201).json({
      message: "Trip created successfully",
      trip,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// 🌍 GET ALL TRIPS (Public)
const getAllTrips = async (req, res) => {
  try {
    const trips = await Trip.find()
      .populate("companyId", "email")
      .populate("companyProfileId", "companyName");

    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// 🔍 GET SINGLE TRIP
const getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate("companyId", "email")
      .populate("companyProfileId", "companyName");

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// ✏️ UPDATE TRIP (Only owner company)
const updateTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    // 🔐 ownership check
    if (trip.companyId.toString() !== req.user._id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const updatedTrip = await Trip.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      message: "Trip updated successfully",
      trip: updatedTrip,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// ❌ DELETE TRIP (Only owner company)
const deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    // 🔐 ownership check
    if (trip.companyId.toString() !== req.user._id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Trip.findByIdAndDelete(req.params.id);

    res.json({ message: "Trip deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// 🔍 SEARCH / FILTER TRIPS (BONUS 🔥)
const searchTrips = async (req, res) => {
  try {
    const { city, minPrice, maxPrice, travelStyle } = req.query;

    let filter = {};

    if (city) filter["destination.city"] = city;
    if (travelStyle) filter.travelStyle = travelStyle;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const trips = await Trip.find(filter);

    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



module.exports = {
  createTrip,
  getAllTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  searchTrips,
};