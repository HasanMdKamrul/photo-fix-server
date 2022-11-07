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

// ********** DB Connection **********

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7ikallh.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    await client.connect();
    console.log("db run connected");
  } catch (error) {
    console.log(error.message);
  }
};

run();

// ** Database and collections

const serviceCollection = client.db("photofix").collection("services");

// ********** DB Connection **********

// ********** API **********

// ** Get All Services

app.get("/services", async (req, res) => {
  try {
    const limit = +req.query.limit;
    const query = {};

    const cursor = serviceCollection.find(query);

    if (limit) {
      const services = await cursor.limit(limit).toArray();
      res.send({
        success: true,
        data: services,
        message: `Successfully data fetched`,
      });
    } else {
      const services = await cursor.toArray();
      res.send({
        success: true,
        data: services,
        message: `Successfully data fetched`,
      });
    }
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

// ********** API **********

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
