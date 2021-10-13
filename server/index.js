const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const authRoute = require("./routes").auth;
const courseRoute = require("./routes").course;
const passport = require("passport");
require("./config/passport")(passport);
const cors = require("cors");

// Connect to DB
mongoose
  .connect(process.env.DB_CONNECT, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connect to Mongo Altas");
  })
  .catch((e) => {
    console.log(e);
  });

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Router setting
app.use("/api/user", authRoute); // set router for route: /api/user
app.use(
  // set router for route: /api/courses
  "/api/courses",
  passport.authenticate("jwt", { session: false }),
  courseRoute
);

// Set connect port
app.listen(8080, () => {
  console.log("Server running on port 8080.");
});
