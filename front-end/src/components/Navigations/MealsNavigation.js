import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Container, Nav } from 'react-bootstrap';

const MealsNavigation = () => {
  return (
    <Container>
      <Nav variant="tabs" className="my-3">
        <NavLink to="all-meals" className="nav-link">
          All Meals
        </NavLink>
        <NavLink to="add-meal" className="nav-link">
          Add Meal
        </NavLink>
      </Nav>
      <Outlet />
    </Container>
  );
};

export default MealsNavigation;
