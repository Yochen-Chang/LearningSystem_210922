import React, { useState, useEffect } from "react";
import { useHistory } from "react-router";
import CourseService from "../services/course.service";

const CourseComponent = (props) => {
  let { currentUser, setCurrentser } = props;
  let history = useHistory();
  let handleTakeToLogin = () => {
    history.push("/login");
  };
  let [courseData, setCourseData] = useState(null);
  useEffect(() => {
    console.log("Use effect for course.");
    let _id;
    if (currentUser) {
      _id = currentUser.user._id;
    } else {
      _id = "";
    }
    if (currentUser.user.role == "instructor") {
      CourseService.get(_id)
        .then((data) => {
          setCourseData(data.data);
        })
        .catch((err) => {
          console.log(err);
        });
    } else if (currentUser.user.role == "student") {
      CourseService.getEnrollCourses(_id)
        .then((data) => {
          setCourseData(data.data);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, []);

  return (
    <div>
      {!currentUser && (
        <div style={{ padding: "3rem" }}>
          <p>You must login first before getting your courses.</p>
          <button
            onClick={handleTakeToLogin}
            className="btn btn-primary btn--lg"
          >
            Take me to login page
          </button>
        </div>
      )}
      {currentUser && currentUser.user.role == "instructor" && (
        <div style={{ padding: "2rem" }}>
          <h1>Welcome to instructor's course page.</h1>
        </div>
      )}
      {currentUser && currentUser.user.role == "student" && (
        <div style={{ padding: "3rem" }}>
          <h1>Welcome to student's course page.</h1>
        </div>
      )}

      {currentUser && courseData && courseData.length != 0 && (
        <div>
          <p style={{ marginLeft: "2rem" }}>
            Here is the data we got back from server.
          </p>
          {courseData.map((course) => (
            <div
              key={course.id}
              className="card"
              style={{ width: "18rem", margin: "2rem" }}
            >
              <div className="card-body">
                <h5 className="card-title">{course.title}</h5>
                <p className="card-text">{course.description}</p>
                <p> Student count: {course.students.length}</p>
                <button className="btn btn-primary">{course.price}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseComponent;
