// ** Inports
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 15000;
require("dotenv").config();
const jwt = require("jsonwebtoken");

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
// const client = new MongoClient(uri, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   serverApi: ServerApiVersion.v1,
// });
const client = new MongoClient(
  uri,
  { useUnifiedTopology: true },
  { useNewUrlParser: true },
  { connectTimeoutMS: 30000 },
  { keepAlive: 1 }
);

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
const reviewCollection = client.db("photofix").collection("reviews");
const photoCollection = client.db("photofix").collection("photos");
const blogCollection = client.db("photofix").collection("blogs");

// ********** DB Connection **********

// ** Verify JWT

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res
      .status(401)
      .send({ success: false, message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res
        .status(403)
        .send({ success: false, message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

// ** Verify JWT

// ********** API **********

// ** Post your service

app.post("/createservice", async (req, res) => {
  try {
    const service = req.body;

    service.time = Date.now();

    console.log(service);

    const result = await serviceCollection.insertOne(service);

    result.insertedId &&
      res.send({
        success: true,
        message: `Service created successfully`,
      });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

// ** Get All Services

// ** Get All Services

// app.get("/allservices", async (req, res) => {
//   try {
//     const size = +req.query.dataPerPage;
//     const currentPage = +req.query.currentPage;

//     console.log(size, currentPage);

//     const query = {};

//     const cursor = serviceCollection.find(query);

//     const services = await cursor
//       .skip(currentPage * size)
//       .limit(size)
//       .toArray();

//     const count = await serviceCollection.estimatedDocumentCount();

//     console.log(count);

//     // console.log(services);

//     res.send({
//       success: true,
//       count,
//       data: services,
//     });
//   } catch (error) {
//     console.log(error.message);
//   }
// });

// * get home page services

app.get("/services", async (req, res) => {
  try {
    const limit = +req.query.limit;
    const size = +req.query.dataPerPage;
    const currentPage = +req.query.currentPage;
    const query = {};

    const cursor = serviceCollection.find(query).sort({ time: -1 });

    if (limit) {
      const services = await cursor.limit(limit).toArray();
      return res.send({
        success: true,
        data: services,
        message: `Successfully data fetched`,
      });
    } else {
      const services = await cursor
        .skip(currentPage * size)
        .limit(size)
        .toArray();
      const count = await serviceCollection.estimatedDocumentCount();
      return res.send({
        success: true,
        count,
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

// ** Single service retrive

app.get("/services/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const query = {
      _id: ObjectId(id),
    };

    const service = await serviceCollection.findOne(query);

    service &&
      res.send({
        success: true,
        data: service,
        message: `Successfully data fetched`,
      });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

// ** Create reviews

app.post("/createreview", async (req, res) => {
  try {
    const review = req.body;

    review.time = Date.now();

    console.log(review);

    const result = await reviewCollection.insertOne(review);

    result.insertedId &&
      res.send({
        success: true,
        message: `Review created successfully`,
      });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

// ** get the reviews of a specific service

app.get("/myreviews", verifyJWT, async (req, res) => {
  try {
    const email = req.query.email;
    console.log(typeof email);

    if (req.decoded.email !== email) {
      return res
        .status(403)
        .send({ success: false, message: "unauthorised access" });
    } else {
      const query = {
        email,
      };

      const cursor = reviewCollection.find(query).sort({ time: -1 });
      const reviews = await cursor.toArray();

      return res.send({
        success: true,
        data: reviews,
        message: `Successfully reviews fetched`,
      });
    }
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

app.get("/reviews", async (req, res) => {
  try {
    const query = {};
    const cursor = reviewCollection.find(query).sort({ time: -1 });

    const reviews = await cursor.toArray();

    return res.send({
      success: true,
      data: reviews,
      message: `Successfully reviews fetched`,
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

// ** Delete Reviews
app.delete("/myreviews/delete/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const query = {
      _id: ObjectId(id),
    };

    const result = await reviewCollection.deleteOne(query);

    result.deletedCount &&
      res.send({
        success: true,
        message: `Successfully Deleted The review`,
      });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

// ** Get Single Review to update

app.get("/update/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const query = {
      _id: ObjectId(id),
    };

    const review = await reviewCollection.findOne(query);

    res.send({
      success: true,
      data: review,
      message: "Successfully retrived review",
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

app.patch("/update/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { reviewText } = req.body;

    console.log(id);
    console.log(reviewText);

    const filter = {
      _id: ObjectId(id),
    };

    const updatedDoc = {
      $set: {
        reviewText: reviewText,
      },
    };

    const result = await reviewCollection.updateOne(filter, updatedDoc);

    result.modifiedCount &&
      res.send({
        success: true,
        message: `data has been successfully updated`,
      });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

// ** get photos

app.get("/photos", async (req, res) => {
  try {
    const query = {};
    const cursor = photoCollection.find(query);
    const photos = await cursor.toArray();

    res.send({
      success: true,
      data: photos,
      message: `Successfully photos fetched`,
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

// ** get blogs Api

app.get("/blogs", async (req, res) => {
  try {
    const query = {};

    const cursor = blogCollection.find(query);
    const blogs = await cursor.toArray();

    res.send({
      success: true,
      data: blogs,
      message: `Successfully blogs fetched`,
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

// ** JWT Token generation Api

app.post("/jwt", (req, res) => {
  const user = req.body;

  //   console.log(user);

  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);

  //   console.log(token);

  res.send({ token: token, message: "Successfully token generated" });
});

// ** JWT Token generation Api

// ********** API **********

// ** listener
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
