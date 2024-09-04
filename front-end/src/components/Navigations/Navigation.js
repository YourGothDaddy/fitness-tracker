import React, { useContext } from "react";
import { BrowserRouter as Router, Route, Routes, Link, NavLink } from 'react-router-dom';
import Home from '../Pages/Home.js';
import MealsNavigation from './MealsNavigation.js';
import AddMealForm from '../Forms/AddMealForm.js';
import AllMealsPage from '../Pages/AllMealsPage.js';
import Register from '../Pages/RegisterPage.js';
import Login from '../Pages/LoginPage.js';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { AuthContext } from '../../Contexts/AuthContext.js';
import ProtectedRoute from "../ProtectedRoute.js";
import ProfileNavigation from "./ProfileNavigation.js";
import GeneralForm from '../Forms/GeneralForm.js'
import GoalsForm from '../Forms/GoalsForm.js'
import DashboardPage from '../Pages/DashboardPage.js';
import AdminNavigation from "./AdminNavigation.js";
import AddConsumableForm from "../Forms/AddConsumableForm.js";
import AddedConsumablesPage from "../Pages/AddedConsumablesPage.js";

const Navigation = () => {
  const { isAuthenticated, isAdmin, logout } = useContext(AuthContext);

  return (
    <Router>
      <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
        <Container>
          <Navbar.Brand as={Link} to="/">
            MyApp
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              {isAuthenticated && (
                <>
                  {isAdmin && (
                    <NavLink to="/admin" className="nav-link">
                      Admin Dashboard
                    </NavLink>
                  )}
                  <NavLink to="/dashboard" className="nav-link">
                    Dashboard
                  </NavLink>
                  <NavLink to="/meals" className="nav-link">
                    Meals
                  </NavLink>
                </>
              )}
              {!isAuthenticated ? (
                <>
                  <NavLink to="/" className="nav-link">
                    Home
                  </NavLink>
                  <NavLink to="/register" className="nav-link">
                    Register
                  </NavLink>
                  <NavLink to="/login" className="nav-link">
                    Login
                  </NavLink>
                </>
              ) : (
                <>
                  <NavLink to="/profile" className="nav-link">
                    Profile
                  </NavLink>
                  <button onClick={logout} className="nav-link">Logout</button>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminNavigation />
            </ProtectedRoute>}>
            <Route index element={<AddConsumableForm />} />
            <Route path="add-consumable" element={<AddConsumableForm />} />
            <Route path="added-consumables" element={<AddedConsumablesPage />} />
          </Route>
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>} />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfileNavigation />
            </ProtectedRoute>}>
            <Route index element={<GeneralForm />} />
            <Route path="general" element={<GeneralForm />} />
            <Route path="goals" element={<GoalsForm />} />
          </Route>
          <Route path="/meals/*" element={
            <ProtectedRoute>
              <MealsNavigation />
            </ProtectedRoute>}>
            <Route index element={<AllMealsPage />} />
            <Route path="all-meals" element={<AllMealsPage />} />
            <Route path="add-meal" element={<AddMealForm />} />
          </Route>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Container>
    </Router>
  );
};

export default Navigation;
