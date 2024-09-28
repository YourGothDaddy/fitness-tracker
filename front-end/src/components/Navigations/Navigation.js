import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import { Navbar, Nav, Container } from "react-bootstrap";
import { AuthContext } from "../../Contexts/AuthContext";

const Navigation = () => {
  const { isAuthenticated, isAdmin, logout } = useContext(AuthContext);

  return (
    <Navbar expand="lg" className="bg-transparent">
      <Container>
        <Navbar.Brand as={NavLink} to="/" className="text-dark">
          MyApp
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto navbar-links">
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
                <button onClick={logout} className="nav-link">
                  Logout
                </button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
