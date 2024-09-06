import React from "react";
import { Container, Form, Alert, Spinner, Button } from "react-bootstrap";
import "../css/CustomForm.css";

const CustomForm = ({
  handleSubmit,
  formOptions,
  isLoading,
  buttonText,
  successMessage,
  errorMessage,
}) => {
  return (
    <Container className="custom-form-container mt-5 mb-5 p-4">
      {errorMessage && (
        <Alert variant="danger" className="mt-3">
          {errorMessage}
        </Alert>
      )}
      {successMessage && (
        <Alert variant="success" className="mt-3">
          {successMessage}
        </Alert>
      )}
      <Form onSubmit={handleSubmit}>
        {Array.from({ length: formOptions.length }).map((key, index) => (
          <Form.Group controlId={formOptions[index].title} className="mb-4">
            <Form.Label className="custom-form-label">
              {formOptions[index].title}
            </Form.Label>
            <Form.Control
              key={key}
              type={formOptions[index].type}
              name={formOptions[index].title}
              value={formOptions[index].value}
              onChange={formOptions[index].handleChange}
              required={formOptions[index].isRequired}
              placeholder={formOptions[index].placeholder}
              className="custom-form-control"
            />
          </Form.Group>
        ))}
        <Button
          variant="primary"
          type="submit"
          disabled={isLoading}
          className="custom-submit-button"
        >
          {isLoading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Loading...
            </>
          ) : (
            `${buttonText}`
          )}
        </Button>
      </Form>
    </Container>
  );
};

export default CustomForm;
