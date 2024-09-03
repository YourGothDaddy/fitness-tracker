import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Container, Nav } from 'react-bootstrap';

const AdminNavigation = () => {
  return (
    <Container>
      <Nav variant="tabs" className="my-3">
        <NavLink to="add-consumable" className="nav-link">
          Add meal
        </NavLink>
      </Nav>
      <Outlet />
    </Container>
  );
};

export default AdminNavigation;
