import React, { useState, useEffect, useCallback } from "react";
import { Container, Form, Alert, Spinner, Button } from "react-bootstrap";
import "../../css/CustomForm.css";

const AddActivityTypeForm = () => {
  const [formData, setFormData] = useState({
    activityType: "",
    selectedActivityCategoryId: "",
  });
  const [status, setStatus] = useState({
    error: "",
    success: "",
    isLoading: false,
  });
  const [activityOptions, setActivityOptions] = useState([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await fetch(
          "https://localhost:7009/api/admin/get-activity-categories",
          { method: "GET", credentials: "include" }
        );
        if (!response.ok)
          throw new Error("Failed to fetch activity categories");
        const data = await response.json();
        setActivityOptions(data);
      } catch (err) {
        console.error("Couldn't retrieve options:", err);
        setStatus((prev) => ({
          ...prev,
          error: "Failed to load activity categories",
        }));
      }
    };

    fetchOptions();
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ error: "", success: "", isLoading: true });
    try {
      const response = await fetch(
        "https://localhost:7009/api/admin/add-activity-type",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Name: formData.activityType,
            ActivityCategoryId: formData.selectedActivityCategoryId,
          }),
        }
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to add activity type");
      setStatus((prev) => ({ ...prev, success: data.message }));
      setFormData((prev) => ({ ...prev, activityType: "" }));
    } catch (err) {
      console.error(err);
      setStatus((prev) => ({ ...prev, error: err.message }));
    } finally {
      setStatus((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name === "Activity Type Name"
        ? "activityType"
        : "selectedActivityCategoryId"]: value,
    }));
  };

  return (
    <Container className="custom-form-container mt-5 mb-5 p-4">
      {status.error && (
        <Alert variant="danger" className="mt-3">
          {status.error}
        </Alert>
      )}
      {status.success && (
        <Alert variant="success" className="mt-3">
          {status.success}
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
            value={formData.activityType}
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
            value={formData.selectedActivityCategoryId}
            onChange={handleChange}
            required
            className="custom-form-control"
          >
            <option value="" disabled>
              Choose an option...
            </option>
            {activityOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
        <Button
          variant="primary"
          type="submit"
          disabled={status.isLoading}
          className="custom-submit-button"
        >
          {status.isLoading ? (
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
            "Add"
          )}
        </Button>
      </Form>
    </Container>
  );
};

export default AddActivityTypeForm;
