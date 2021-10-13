const router = require("express").Router();
const registerValidation = require("../validation").registerValidation;
const loginValidation = require("../validation").loginValidation;
const User = require("../models/user-model");
const jwt = require("jsonwebtoken");

// Middleware
router.use((req, res, next) => {
  console.log("A request is coming into auth.js.");
  next();
});

// For testing
router.get("/testAPI", (req, res) => {
  const msgObj = {
    message: "Test API is working.",
  };
  return res.json(msgObj);
});

// Register user
router.post("/register", async (req, res) => {
  // check the validation of the data
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // check the email exists
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) return res.status(400).send("The email has been registered.");

  // create an user
  const newUser = new User({
    email: req.body.email,
    username: req.body.username,
    password: req.body.password,
    role: req.body.role,
  });

  // save the user in to DB
  try {
    const savedUser = await newUser.save();
    res.status(200).send({
      msg: "The user has been saved",
      saveObject: savedUser,
    });
  } catch (err) {
    res.status(400).send("The user is not saved.");
  }
});

// User login
router.post("/login", (req, res) => {
  // check the validation of the data
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // find the user data by email
  User.findOne({ email: req.body.email }, function (err, user) {
    if (err) {
      res.status(400).send(err);
    }
    if (!user) {
      res.status(401).send("User is not founded.");
    } else {
      user.comparePassword(req.body.password, function (err, isMatch) {
        if (err) {
          res.status(400).send(err);
        }
        if (isMatch) {
          const tokenObject = { _id: user._id, email: user.email };
          const token = jwt.sign(tokenObject, process.env.PASSPORT_SECRET);
          res.status(200).send({ success: true, token: "jwt " + token, user });
        } else {
          res.status(401).send("Wrong Password.");
        }
      });
    }
  });
});

module.exports = router;
