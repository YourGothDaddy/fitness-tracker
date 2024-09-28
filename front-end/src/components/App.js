import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Navigation from "./Navigations/Navigation";
import AppRoutes from "../AppRoutes";
import "../css/App.css";

function App() {
  return (
    <Router>
      <div className="app-container">
        <div className="navbar-container">
          <Navigation />
        </div>
        <div className="routes-container">
          <AppRoutes />
        </div>
      </div>
    </Router>
  );
}

export default App;
