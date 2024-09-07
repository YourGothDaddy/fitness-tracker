import React, { useState, useEffect } from "react";
import "../../css/GoalsForm.css";
import { Form, Button, Container, Row, Col, Alert } from "react-bootstrap";

// Define the base API URL
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://localhost:7009/api";

const GoalsForm = () => {
  const [goals, setGoals] = useState({
    dailyCalories: "",
    monthlyCalories: "",
    currentWeight: "",
    goalWeight: "",
    height: "",
    isDailyCaloriesGoal: true,
  });

  const [message, setMessage] = useState({ text: "", type: "" });
  const [caloriesOption, setCaloriesOption] = useState("daily");

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/goals`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to retrieve goals");

      const data = await response.json();
      setCaloriesOption(data.isDailyCaloriesGoal ? "daily" : "monthly");
      setGoals({
        dailyCalories: data.dailyCaloriesGoal || "",
        monthlyCalories: data.monthlyCaloriesGoal || "",
        currentWeight: data.weight || "",
        goalWeight: data.goalWeight || "",
        height: data.height || "",
        isDailyCaloriesGoal: data.isDailyCaloriesGoal,
      });
    } catch (err) {
      setMessage({ text: err.message, type: "danger" });
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const newValue = type === "radio" ? value === "daily" : value;
    setGoals((prevGoals) => ({ ...prevGoals, [name]: newValue }));
    if (type === "radio") setCaloriesOption(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${API_BASE_URL}/user/change-goals-and-data-info`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            DailyCaloriesGoal: goals.dailyCalories,
            MonthlyCaloriesGoal: goals.monthlyCalories,
            Weight: goals.currentWeight,
            GoalWeight: goals.goalWeight,
            Height: goals.height,
            IsDailyCaloriesGoal: goals.isDailyCaloriesGoal,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to update goals");
      setMessage({ text: "Goals updated successfully", type: "success" });
    } catch (err) {
      setMessage({ text: err.message, type: "danger" });
    }
  };

  const renderFormField = (label, name, placeholder = "") => (
    <Form.Group controlId={name}>
      <Form.Label>{label}</Form.Label>
      <Form.Control
        type="number"
        name={name}
        value={goals[name]}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={
          name.includes("Calories") &&
          caloriesOption !== name.split("Calories")[0]
        }
        className={
          name.includes("Calories") &&
          caloriesOption !== name.split("Calories")[0]
            ? "disabled-input"
            : ""
        }
      />
    </Form.Group>
  );

  return (
    <Container className="goals-form">
      <h2>Your Goals</h2>
      {message.text && <Alert variant={message.type}>{message.text}</Alert>}
      <Form onSubmit={handleSubmit} className="goals-form">
        <Row className="mb-3">
          <Col md={12}>
            <Form.Group controlId="caloriesOption">
              <Form.Label>Select Calories Goal Type</Form.Label>
              <div className="d-flex justify-content-start">
                {["daily", "monthly"].map((option) => (
                  <Form.Check
                    key={option}
                    type="radio"
                    label={`${
                      option.charAt(0).toUpperCase() + option.slice(1)
                    } Calories Goal`}
                    name="isDailyCaloriesGoal"
                    value={option}
                    checked={caloriesOption === option}
                    onChange={handleChange}
                    className="mr-3"
                  />
                ))}
              </div>
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            {renderFormField("Daily Calories Goal", "dailyCalories")}
          </Col>
          <Col md={6}>
            {renderFormField("Monthly Calories Goal", "monthlyCalories")}
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            {renderFormField(
              "Current Weight (kg)",
              "currentWeight",
              "Enter current weight"
            )}
          </Col>
          <Col md={6}>
            {renderFormField(
              "Goal Weight (kg)",
              "goalWeight",
              "Enter goal weight"
            )}
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            {renderFormField("Height (cm)", "height", "Enter height")}
          </Col>
        </Row>
        <Button variant="primary" type="submit" className="fancy-button">
          Save Goals
        </Button>
      </Form>
    </Container>
  );
};

export default GoalsForm;
