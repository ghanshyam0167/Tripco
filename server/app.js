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

app.get("/", (req, res) => {
  res.send("Tripco API running 🚀");
});
app.use("/api/auth", authRoutes);

app.listen(PORT, ()=> {
    console.log("Server started at: ", PORT)
})