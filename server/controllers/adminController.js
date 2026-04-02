const User = require("../models/User");
const Trip = require("../models/Trip");
const Booking = require("../models/Booking");
const CompanyProfile = require("../models/CompanyProfile");
const TravelerProfile = require("../models/TravelerProfile");

// ─── Platform Stats ────────────────────────────────────────────────────────
const getStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalTrips,
      totalBookings,
      totalCompanies,
      verifiedCompanies,
      pendingCompanies,
    ] = await Promise.all([
      User.countDocuments(),
      Trip.countDocuments(),
      Booking.countDocuments(),
      User.countDocuments({ role: "COMPANY" }),
      CompanyProfile.countDocuments({ isVerified: true }),
      CompanyProfile.countDocuments({ verificationStatus: "pending" }),
    ]);

    // Revenue from confirmed bookings
    const revenueAgg = await Booking.aggregate([
      { $match: { status: "confirmed" } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    // Monthly booking trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrend = await Booking.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
          revenue: { $sum: "$totalPrice" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    return res.status(200).json({
      totalUsers,
      totalTrips,
      totalBookings,
      totalCompanies,
      verifiedCompanies,
      pendingCompanies,
      totalRevenue,
      monthlyTrend,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load stats", error: error.message });
  }
};

// ─── All Users ─────────────────────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (role) filter.role = role.toUpperCase();

    const users = await User.find(filter)
      .select("-password -salt -emailOTP")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await User.countDocuments(filter);

    return res.status(200).json({ users, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load users", error: error.message });
  }
};

// ─── Toggle User Active Status ─────────────────────────────────────────────
const toggleUserActive = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isActive = !user.isActive;
    await user.save();
    return res.status(200).json({ message: `User ${user.isActive ? "activated" : "deactivated"}`, user });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ─── Delete User Completely ──────────────────────────────────────────────────
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === "COMPANY") {
      await CompanyProfile.findOneAndDelete({ userId: user._id });
      await Trip.deleteMany({ companyId: user._id });
    } else {
      await TravelerProfile.findOneAndDelete({ userId: user._id });
    }

    await Booking.deleteMany({ userId: user._id });
    await User.findByIdAndDelete(user._id);

    return res.status(200).json({ message: "User completely deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete user", error: error.message });
  }
};

// ─── Pending Company Verifications ─────────────────────────────────────────
const getPendingCompanies = async (req, res) => {
  try {
    const companies = await CompanyProfile.find({ verificationStatus: "pending" })
      .populate("userId", "email createdAt")
      .populate("verificationHistory.updatedBy", "email")
      .sort({ createdAt: -1 });

    return res.status(200).json(companies);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ─── All Companies ─────────────────────────────────────────────────────────
const getAllCompanies = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.verificationStatus = status;

    const companies = await CompanyProfile.find(filter)
      .populate("userId", "email createdAt isActive")
      .populate("verificationHistory.updatedBy", "email")
      .sort({ createdAt: -1 });

    return res.status(200).json(companies);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ─── Approve Company ───────────────────────────────────────────────────────
const approveCompany = async (req, res) => {
  try {
    const { message } = req.body;
    const company = await CompanyProfile.findById(req.params.id);
    if (!company) return res.status(404).json({ message: "Company not found" });

    company.verificationStatus = "approved";
    company.isVerified = true;
    company.verificationMessage = message || "Your company profile has been approved.";

    company.verificationHistory.push({
      status: "approved",
      reason: message || "Your company profile has been approved.",
      updatedBy: req.user._id,
    });

    await company.save();

    return res.status(200).json({ message: "Company approved", company });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ─── Reject Company ────────────────────────────────────────────────────────
const rejectCompany = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: "Rejection reason is required" });

    const company = await CompanyProfile.findById(req.params.id);
    if (!company) return res.status(404).json({ message: "Company not found" });

    company.verificationStatus = "rejected";
    company.isVerified = false;
    company.verificationMessage = message;

    company.verificationHistory.push({
      status: "rejected",
      reason: message,
      updatedBy: req.user._id,
    });

    await company.save();

    return res.status(200).json({ message: "Company rejected", company });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ─── Recent Bookings ───────────────────────────────────────────────────────
const getRecentBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("userId", "email")
      .populate("tripId", "title destination price")
      .sort({ createdAt: -1 })
      .limit(10);

    return res.status(200).json(bookings);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStats,
  getAllUsers,
  toggleUserActive,
  deleteUser,
  getPendingCompanies,
  getAllCompanies,
  approveCompany,
  rejectCompany,
  getRecentBookings,
};
