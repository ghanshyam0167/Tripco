const CompanyProfile = require("../models/CompanyProfile");


// 🔹 GET PROFILE
const getCompanyProfile = async (req, res) => {
  try {
    const profile = await CompanyProfile.findOne({
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


// 🔹 UPDATE PROFILE
const updateCompanyProfile = async (req, res) => {
  try {
    const updatedProfile = await CompanyProfile.findOneAndUpdate(
      { userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
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
const deleteCompanyProfile = async (req, res) => {
  try {
    await CompanyProfile.findOneAndDelete({
      userId: req.user._id,
    });

    res.json({ message: "Profile deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  getCompanyProfile,
  updateCompanyProfile,
  deleteCompanyProfile,
};