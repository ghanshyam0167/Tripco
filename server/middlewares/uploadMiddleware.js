const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { Readable } = require("stream");
const dotenv = require("dotenv");

dotenv.config();

// ─── Cloudinary Config ─────────────────────────────────────────────────────
console.log("Cloudinary ENV:", {
  cloud: process.env.CLOUD_NAME,
  key: process.env.CLOUD_API_KEY,
});

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key:    process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});


// ─── Image filter ──────────────────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpg, jpeg, png)."), false);
  }
};

// ─── Multer — memory storage (zero disk access, Vercel-safe) ───────────────
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per file
});

// ─── Helper: stream a buffer directly to Cloudinary ────────────────────────
const uploadToCloudinary = (buffer, folder = "tripco_uploads") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    Readable.from(buffer).pipe(stream);
  });
};

module.exports = { upload, uploadToCloudinary };
