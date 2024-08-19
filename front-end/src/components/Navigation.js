import React, { useContext } from "react";
import { BrowserRouter as Router, Route, Routes, Link, NavLink } from 'react-router-dom';
import Home from './Pages/Home';
import Meals from './Pages/Meals';
import Register from './Pages/RegisterPage';
import Login from './Pages/LoginPage';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { AuthContext } from '../Contexts/AuthContext';

const Navigation = () => {
  const { isAuthenticated, userInfo, logout } = useContext(AuthContext);

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
              <NavLink to="/" className="nav-link">
                Home
              </NavLink>
              <NavLink to="/meals" className="nav-link">
                Meals
              </NavLink>
              {!isAuthenticated ? (
                <>
                  <NavLink to="/register" className="nav-link">
                    Register
                  </NavLink>
                  <NavLink to="/login" className="nav-link">
                    Login
                  </NavLink>
                </>
              ) : (
                <>
                  <span className="nav-link">Welcome, {userInfo?.userName}</span>
                  <button onClick={logout} className="nav-link">Logout</button>
                </>

              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/meals" element={<Meals />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
};

export default Navigation;
