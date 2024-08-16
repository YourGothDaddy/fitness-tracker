import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, NavLink } from 'react-router-dom';
import Home from './Pages/Home';
import Meals from './Pages/Meals';
import { Navbar, Nav, Container } from 'react-bootstrap';

function App() {
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
              <NavLink exact to="/" className="nav-link" activeClassName="active">
                Home
              </NavLink>
              <NavLink to="/meals" className="nav-link" activeClassName="active">
                Meals
              </NavLink>
            </Nav>  
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/meals" element={<Meals />} />
        {/* Add more Routes here as needed */}
      </Routes>
    </Router>
  );
}

export default App;
