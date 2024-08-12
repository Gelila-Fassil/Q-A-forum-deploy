require("dotenv").config();

const express = require("express");
const app = express();
const port = 5400;

const cors = require("cors");
app.use(cors());

// db connection
const dbConnection = require("./db/Config.js");

// user routes middleware file import
const userRoutes = require("./routes/userRoutes");

// question routes middleware file import
const questionRoute = require("./routes/questionRoutes");

// question routes middleware file import
const answerRoute = require("./routes/answerRoutes");

// like route middleware file import
const likeRoute = require("./routes/likeRoute");

// import rateLimitMiddleware
const limiter = require("./middleware/rateLimitMiddleware");

// json middleware to extract json data
app.use(express.json());

// user routes middleware file
app.use("/api/user", userRoutes);

// apply rate-limiting middleware to the login route
app.use("/api/user/login", limiter);

// question routes middleware
app.use("/api/question", questionRoute);

// answer routes middleware file
app.use("/api/answer", answerRoute);

// like routes
app.use("/api/answer/:answerId", likeRoute);

async function start() {
  try {
    const result = await dbConnection.execute("select 'test' ");
    await app.listen(port);
    console.log("database connection established");
    console.log(`listening on port ${port}`);
  } catch (error) {
    console.log(error.message);
  }
}
start();