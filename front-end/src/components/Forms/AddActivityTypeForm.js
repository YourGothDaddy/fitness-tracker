import React, { useState, useEffect } from "react";
import { Container, Form, Alert, Spinner, Button } from "react-bootstrap";
import "../../css/CustomForm.css";

const AddActivityTypeForm = () => {
  const [activityType, setActivityType] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [activityOptions, setActivityOptions] = useState([]);
  const [selectedActivityCategoryId, setSelectedActivityCategoryId] =
    useState("");

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await fetch(
          "https://localhost:7009/api/admin/get-activity-categories",
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await response.json();
        setActivityOptions(data);
      } catch (err) {
        console.log("Couldn't retrieve options");
      }
    };

    fetchOptions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const response = await fetch(
        "https://localhost:7009/api/admin/add-activity-type",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            Name: activityType,
            ActivityCategoryId: selectedActivityCategoryId,
          }),
        }
      );
      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.message);
      } else {
        setErrorMessage(data.message);
      }
    } catch (err) {
      console.log(err);
      setErrorMessage(err.message);
      setSuccessMessage("");
    } finally {
      setIsLoading(false);
      resetForm();
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === "Activity Type Name") {
      setActivityType(value);
    } else if (name === "Activity Category") {
      setSelectedActivityCategoryId(value);
    }
  };

  const resetForm = () => {
    setActivityType("");
  };

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
        <Form.Group className="mb-4">
          <Form.Label className="custom-form-label">
            Activity Type Name
          </Form.Label>
          <Form.Control
            type="text"
            name="Activity Type Name"
            value={activityType}
            onChange={handleChange}
            required
            placeholder="Enter activity type name"
            className="custom-form-control"
          />
        </Form.Group>
        <Form.Group className="mb-4">
          <Form.Label className="custom-form-label">
            Select an Option
          </Form.Label>
          <Form.Select
            name="Activity Category"
            value={selectedActivityCategoryId}
            onChange={handleChange}
            required
            className="custom-form-control"
          >
            <option value="" disabled>
              Choose an option...
            </option>
            {activityOptions.map((activityOption) => (
              <option key={activityOption.id} value={activityOption.id}>
                {activityOption.name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
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
            `Add`
          )}
        </Button>
      </Form>
    </Container>
  );
};

export default AddActivityTypeForm;
