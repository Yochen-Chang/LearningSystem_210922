const router = require("express").Router();
const Course = require("../models").courseModel;
const courseValidation = require("../validation").courseValidation;

// Middleware
router.use((req, res, next) => {
  console.log("A request is coming into api...");
  next();
});

// Find all courses by GET
router.get("/", (req, res) => {
  Course.find({})
    .populate("instructor", ["username", "email"]) // capture the data of instructor
    .then((course) => {
      res.send(course);
    })
    .catch(() => {
      res.status(500).send("Error!!! can't get any course!");
    });
});

// Find the courses by instructor
router.get("/instructor/:_instructor_id", (req, res) => {
  let { _instructor_id } = req.params;
  Course.find({ instructor: _instructor_id })
    .populate("instructor", ["username", "email"])
    .then((data) => {
      res.send(data);
    })
    .catch(() => {
      res.status(500).send("Can't not get the course data.(instructor)");
    });
});

// Find the courses by student
router.get("/student/:_student_id", (req, res) => {
  let { _student_id } = req.params;
  Course.find({ students: _student_id })
    .populate("instructor", ["username", "email"])
    .then((courses) => {
      res.status(200).send(courses);
    })
    .catch(() => {
      res.status(500).send("Can't not get the course data.(student)");
    });
});

// Find the course bt title

router.get("/findByName/:name", (req, res) => {
  let { name } = req.params;
  Course.find({ title: name })
    .populate("instructor", ["username", "email"])
    .then((course) => {
      res.status(200).send(course);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

// Find the course by GET ( use id )
router.get("/:_id", (req, res) => {
  let { _id } = req.params;
  Course.findOne({ _id })
    .populate("instructor", ["username", "email"]) // capture the data of instructor
    .then((course) => {
      res.send(course);
    })
    .catch((e) => {
      res.send(e);
    });
});

// Create a course by POST
router.post("/", async (req, res) => {
  // validate the inputs before making a new course
  const { error } = courseValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  let { title, description, price } = req.body;

  // Check the role of user
  if (req.user.isStudent()) {
    return res.status(400).send("Only instructor can post a new course.");
  }

  // set new course
  let newCourse = new Course({
    title,
    description,
    price,
    instructor: req.user._id,
  });

  // Save new course to DB
  try {
    await newCourse.save();
    res.status(200).send("New course has been saved.");
  } catch (err) {
    res.status(400).send("Cannot save course.");
  }
});

// Enroll course
router.post("/enroll/:_id", async (req, res) => {
  let { _id } = req.params;
  let { user_id } = req.body;
  try {
    let course = await Course.findOne({ _id });
    course.students.push(user_id);
    await course.save();
    res.send("Enroll successfully.");
  } catch (err) {
    res.send(err);
  }
});

// Modify the course by PATCH
router.patch("/:_id", async (req, res) => {
  // validate the inputs before making a new course
  const { error } = courseValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Find course from DB by id
  let { _id } = req.params;
  let course = await Course.findOne({ _id });
  if (!course) {
    res.status(400);
    return res.json({
      success: false,
      message: "Course not found",
    });
  }

  // Check the role of user and update the course ( data from req.body )
  if (course.instructor.equals(req.user._id) || req.user.isAdmin()) {
    Course.findByIdAndUpdate({ _id }, req.body, {
      new: true,
      runValidators: true,
    })
      .then(() => {
        res.send("Course updated.");
      })
      .catch((e) => {
        res.send({
          success: false,
          message: e,
        });
      });
  } else {
    res.status(403);
    return res.json({
      success: false,
      message:
        "Only the instructor of this course and the web admin can modify this course.",
    });
  }
});

// Delete the course by DELETE
router.delete("/:_id", async (req, res) => {
  // Find course from DB by id
  let { _id } = req.params;
  let course = await Course.findOne({ _id });
  if (!course) {
    res.status(400);
    return res.json({
      success: false,
      message: "Course not found",
    });
  }

  // Check the role of user and update the course ( data from req.body )
  if (course.instructor.equals(req.user._id) || req.user.isAdmin()) {
    Course.deleteOne({ _id })
      .then(() => {
        res.send("Course deleted.");
      })
      .catch((e) => {
        res.send({
          success: false,
          message: e,
        });
      });
  } else {
    res.status(403);
    return res.json({
      success: false,
      message:
        "Only the instructor of this course and the web admin can modify this course.",
    });
  }
});

module.exports = router;
