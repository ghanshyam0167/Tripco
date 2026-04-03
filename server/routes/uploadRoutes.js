const express = require("express");
const router = express.Router();
const { upload, uploadToCloudinary } = require("../middlewares/uploadMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/authorizeRoles");

// Accept up to 10 images at once
router.post(
  "/",
  [authMiddleware, authorizeRoles("COMPANY")],
  upload.array("images", 10),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No images provided" });
      }

      // Upload each file buffer to Cloudinary
      const uploadPromises = req.files.map((file) => 
        uploadToCloudinary(file.buffer)
      );
      
      const urls = await Promise.all(uploadPromises);

      res.status(200).json({ urls });
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      res.status(500).json({ message: "Error uploading images", error: error.message });
    }
  }
);

module.exports = router;
