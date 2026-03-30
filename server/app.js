const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv")
dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Tripco API running 🚀");
});

app.listen(PORT, ()=> {
    console.log("Server started at: ", PORT)
})