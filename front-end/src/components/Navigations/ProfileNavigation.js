import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Container, Nav } from 'react-bootstrap';

const ProfileNavigation = () => {
  return (
    <Container>
      <Nav variant="tabs" className="my-3">
        <NavLink to="general" className="nav-link">
          General
        </NavLink>
        <NavLink to="goals" className="nav-link">
          Goals
        </NavLink>
      </Nav>
      <Outlet />
    </Container>
  );
};

export default ProfileNavigation;
