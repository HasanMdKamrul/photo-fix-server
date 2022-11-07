// ** Inports

const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 15000;
require("dotenv").config();

// ** Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ** Test Route
app.get("/", (req, res) => {
  res.send(`Server is running on port ${port}`);
});

// ** listener
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
