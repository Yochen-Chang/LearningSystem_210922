import React, { useState, useEffect } from "react";
import AuthService from "../services/auth.service";

const ProfileComponent = (props) => {
  let { currentUser, setCurrentUser } = props;
  return (
    <div style={{ padding: "3rem" }}>
      {!currentUser && (
        <div style={{ color: "red", fontWeight: "bold" }}>
          You must login first before getting your profile.{" "}
        </div>
      )}
      {currentUser && (
        <div>
          <h1>In profile page</h1>
          <header className="jumbotron">
            <h3>{currentUser.user.username}</h3>
          </header>
          <p>
            <strong>Token: {currentUser.token}</strong>
          </p>
          <p>
            <strong>ID: {currentUser.user._id}</strong>
          </p>
          <p>
            <strong>Email: {currentUser.user.email}</strong>
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfileComponent;
