const TravelerProfile = require("../models/TravelerProfile");

// 🔹 GET PROFILE
const getTravelerProfile = async (req, res) => {
  try {
    const profile = await TravelerProfile.findOne({
      userId: req.user._id,
    }).populate("userId", "email role");

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 UPDATE (or CREATE) PROFILE — upsert so profile completion in step 3 works
const updateTravelerProfile = async (req, res) => {
  try {
    const updatedProfile = await TravelerProfile.findOneAndUpdate(
      { userId: req.user._id },
      { ...req.body, userId: req.user._id },
      { new: true, runValidators: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({
      message: "Profile updated successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 DELETE PROFILE
const deleteTravelerProfile = async (req, res) => {
  try {
    await TravelerProfile.findOneAndDelete({ userId: req.user._id });
    res.json({ message: "Profile deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTravelerProfile,
  updateTravelerProfile,
  deleteTravelerProfile,
};