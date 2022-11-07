// ** Inports
const { MongoClient, ServerApiVersion } = require("mongodb");
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

// ********** DB Collection **********

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7ikallh.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

console.log(uri);

// ********** DB Collection **********

// ** listener
app.listen(port, () => {
  client.connect((err) => {
    if (err) {
      console.log(err.message);
    } else {
      console.log("DB Connected");
    }
  });
  console.log(`Server is running on port: ${port}`);
});
