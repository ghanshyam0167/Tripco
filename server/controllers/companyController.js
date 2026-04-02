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

// 🔹 UPDATE (or CREATE) PROFILE — upsert so profile completion in step 3 works
const updateCompanyProfile = async (req, res) => {
  try {
    // Ensure contactEmail defaults to the user's email if not provided
    const updateData = {
      ...req.body,
      userId: req.user._id,
      contactEmail: req.body.contactEmail || req.user.email,
    };

    const updatedProfile = await CompanyProfile.findOneAndUpdate(
      { userId: req.user._id },
      updateData,
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
const deleteCompanyProfile = async (req, res) => {
  try {
    await CompanyProfile.findOneAndDelete({ userId: req.user._id });
    res.json({ message: "Profile deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 REQUEST VERIFICATION
const requestVerification = async (req, res) => {
  try {
    const profile = await CompanyProfile.findOne({ userId: req.user._id });
    if (!profile)
      return res.status(404).json({ message: "Company profile not found" });

    if (profile.verificationStatus === "approved")
      return res.status(400).json({ message: "Company is already verified" });

    profile.verificationStatus = "pending";
    profile.verificationMessage = "Request initialized by company.";
    profile.verificationHistory.push({
      status: "pending",
      reason: "Company submitted verification request.",
      updatedBy: req.user._id,
    });
    
    await profile.save();

    res.json({ message: "Verification request submitted. Admin will review shortly.", profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCompanyProfile,
  updateCompanyProfile,
  deleteCompanyProfile,
  requestVerification,
};