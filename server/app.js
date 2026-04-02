const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");
dotenv.config();

const PORT = process.env.PORT || 8000;
const app = express();

// ─── Database ──────────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// ─── Security headers ──────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: false }));

// ─── CORS ──────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

// ─── Body parser ───────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// ─── Rate limiters ─────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { message: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(globalLimiter);

// ─── Routes ────────────────────────────────────────────────────────────────
const authRoutes     = require("./routes/authRoutes");
const travelerRoutes = require("./routes/travelerRoutes");
const companyRoutes  = require("./routes/companyRoutes");
const tripRoutes     = require("./routes/tripRoutes");
const bookingRoutes  = require("./routes/bookingRoutes");
const adminRoutes    = require("./routes/adminRoutes");

const errorHandler = require("./middlewares/errorHandler");
const notFound     = require("./middlewares/notFound");

app.get("/", (req, res) => res.json({ message: "Tripco API 🚀", version: "1.0.0" }));
app.get("/health", (req, res) => res.json({ status: "OK", timestamp: new Date() }));

app.use("/api/auth",     authLimiter, authRoutes);
app.use("/api/traveler", travelerRoutes);
app.use("/api/company",  companyRoutes);
app.use("/api/trips",    tripRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin",    adminRoutes);

app.use(notFound);
app.use(errorHandler);

// ─── Start ─────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🌍 Allowed origins: ${allowedOrigins.join(", ")}`);
});