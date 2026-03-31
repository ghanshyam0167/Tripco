const express = require("express");
const mongoose = require('mongoose')
const cors = require("cors");
const dotenv = require("dotenv")
dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();
mongoose.connect(process.env.MONGO_URL).then(()=> console.log("MongoDb connected")).catch(err => console.log("MongoDB connection error:", err));

app.use(cors({
  origin: "*",
}));
app.use(express.json());

const authRoutes = require("./routes/authRoutes");
const travelerRoutes = require("./routes/travelerRoutes");
const companyRoutes = require("./routes/companyRoutes");
const errorHandler = require("./middlewares/errorHandler");
const notFound = require("./middlewares/notFound");

app.get("/", (req, res) => {
  res.send("Tripco API running 🚀");
});
app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

app.use("/api/auth", authRoutes);
app.use("/api/traveler", travelerRoutes);
app.use("/api/company", companyRoutes);

app.use(notFound);     // 404 handler
app.use(errorHandler); // global error handler

app.listen(PORT, ()=> {
    console.log("Server started at: ", PORT)
})