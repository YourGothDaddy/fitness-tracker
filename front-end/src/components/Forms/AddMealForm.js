import React, { useState } from "react";
import PropTypes from "prop-types";
import { Form, Button, Container, Alert } from "react-bootstrap";
import "../../css/AddMealForm.css";

const MEAL_TYPES = [
  { value: 0, label: "Breakfast" },
  { value: 1, label: "Lunch" },
  { value: 2, label: "Dinner" },
  { value: 3, label: "Snack" },
];

const AddMealForm = ({ onAddMeal }) => {
  const [formData, setFormData] = useState({
    name: "",
    mealOfTheDay: "",
    calories: "",
  });
  const [status, setStatus] = useState({
    error: "",
    success: "",
    isLoading: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Meal name is required.";
    if (formData.mealOfTheDay === "") return "Please select a meal type.";
    if (Number(formData.calories) <= 0)
      return "Calories must be a positive number.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      setStatus({ ...status, error });
      return;
    }

    setStatus({ ...status, isLoading: true, error: "" });

    try {
      const response = await fetch("https://localhost:7009/api/meal/add-meal", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          mealOfTheDay: parseInt(formData.mealOfTheDay),
          calories: Number(formData.calories),
        }),
      });

      if (!response.ok) throw new Error("Adding a meal failed");

      setStatus({
        isLoading: false,
        error: "",
        success: "Meal added successfully!",
      });
      onAddMeal();
      setFormData({ name: "", mealOfTheDay: "", calories: "" });
    } catch (err) {
      setStatus({ ...status, isLoading: false, error: err.message });
    }
  };

  return (
    <Container className="add-meal-form">
      <h2>Add a New Meal</h2>
      <Form onSubmit={handleSubmit} className="meal-form">
        {status.error && <Alert variant="danger">{status.error}</Alert>}
        {status.success && <Alert variant="success">{status.success}</Alert>}

        <Form.Group controlId="mealName" className="mb-3">
          <Form.Label>Meal Name</Form.Label>
          <Form.Control
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter meal name"
          />
        </Form.Group>

        <Form.Group controlId="mealType" className="mb-3">
          <Form.Label>Meal Type</Form.Label>
          <Form.Select
            name="mealOfTheDay"
            value={formData.mealOfTheDay}
            onChange={handleChange}
          >
            <option value="">Select meal type</option>
            {MEAL_TYPES.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group controlId="calories" className="mb-3">
          <Form.Label>Calories</Form.Label>
          <Form.Control
            type="number"
            name="calories"
            value={formData.calories}
            onChange={handleChange}
            placeholder="Enter calories"
          />
        </Form.Group>

        <Button
          type="submit"
          className="fancy-button"
          disabled={status.isLoading}
        >
          {status.isLoading ? "Adding..." : "Add Meal"}
        </Button>
      </Form>
    </Container>
  );
};

AddMealForm.propTypes = {
  onAddMeal: PropTypes.func.isRequired,
};

export default AddMealForm;
