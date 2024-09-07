import React from "react";
import { Link } from "react-router-dom";
import "../../css/404Page.css"; // We'll create this CSS file next

const NotFoundPage = () => {
  return (
    <div className="not-found-container">
      <h1>404 - Workout Interrupted!</h1>
      <div className="apple-container">
        <div className="apple">
          <div className="apple-body"></div>
          <div className="apple-leaf"></div>
        </div>
      </div>
      <p className="error-message">
        Oops! You've stumbled into our digital gym's rest area.
      </p>
      <p className="motivation"></p>
      <Link to="/" className="home-button">
        Jog Back to Homepage
      </Link>
    </div>
  );
};

export default NotFoundPage;
