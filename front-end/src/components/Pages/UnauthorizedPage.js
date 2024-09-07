import React from "react";
import { Link } from "react-router-dom";
import { Container, Alert, Button } from "react-bootstrap";

const UnauthorizedPage = () => {
  return (
    <Container className="mt-5">
      <Alert variant="danger">
        <Alert.Heading>Unauthorized Access</Alert.Heading>
        <p>
          You do not have permission to access this page. Please log in with the
          appropriate credentials or return to the home page.
        </p>
        <hr />
        <div className="d-flex justify-content-end">
          <Link to="/">
            <Button variant="outline-danger">Go to Home</Button>
          </Link>
        </div>
      </Alert>
    </Container>
  );
};

export default UnauthorizedPage;
