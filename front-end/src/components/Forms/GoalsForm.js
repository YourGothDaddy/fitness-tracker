import React, { useState, useEffect } from 'react';
import '../../css/GoalsForm.css';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';

const GoalsForm = () => {
  const [goals, setGoals] = useState({
    dailyCalories: '',
    monthlyCalories: '',
    currentWeight: '',
    goalWeight: '',
    height: '',
    isDailyCaloriesGoal: ''
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [caloriesOption, setCaloriesOption] = useState('daily');

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const response = await fetch('https://localhost:7009/api/user/goals', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Retrieving goals failed');
        }

        const data = await response.json();
        setCaloriesOption(data.isDailyCaloriesGoal ? 'daily' : 'monthly');
        setGoals({
          dailyCalories: data.dailyCaloriesGoal || '',
          monthlyCalories: data.monthlyCaloriesGoal || '',
          currentWeight: data.weight || '',
          goalWeight: data.goalWeight || '',
          height: data.height || '',
          IsDailyCaloriesGoal: data.isDailyCaloriesGoal
        });
        setErrorMessage('');
      } catch (err) {
        setErrorMessage(err.message);
      }
    };

    fetchGoals();
  }, []);


  const handleChange = (e) => {
    if (e.target.value == 'daily' || e.target.value == 'monthly') {
      setCaloriesOption(e.target.value);
      setGoals({ ...goals, [e.target.name]: e.target.value === 'daily' });
    } else {
      setGoals({ ...goals, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://localhost:7009/api/user/change-goals-info', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          DailyCaloriesGoal: goals.dailyCalories,
          MonthlyCaloriesGoal: goals.monthlyCalories,
          Weight: goals.currentWeight,
          GoalWeight: goals.goalWeight,
          Height: goals.height,
          IsDailyCaloriesGoal: goals.IsDailyCaloriesGoal
        })
      });

      if (!response.ok) {
        throw new Error('Changing goals failed');
      }
      setSuccessMessage('Success');
      setErrorMessage('');
    } catch (err) {
      setSuccessMessage('');
      setErrorMessage(err.message);
    }
  };


  return (
    <Container className="goals-form">
      <h2>Your Goals</h2>
      {
        errorMessage
          ? (errorMessage && (
            <div className="alert alert-danger" role="alert">
              {errorMessage}
            </div>
          ))
          :
          successMessage && (
            <div className="alert alert-success" role="alert">
              {successMessage}
            </div>
          )
      }
      <Form onSubmit={handleSubmit} className="goals-form">
        <Row className="mb-3">
          <Col md={12}>
            <Form.Group controlId="caloriesOption">
              <Form.Label>Select Calories Goal Type</Form.Label>
              <div className="d-flex justify-content-start">
                <Form.Check
                  type="radio"
                  label="Daily Calories Goal"
                  name="IsDailyCaloriesGoal"
                  value="daily"
                  checked={caloriesOption === 'daily'}
                  onChange={handleChange}
                  className="mr-3"
                />
                <Form.Check
                  type="radio"
                  label="Monthly Calories Goal"
                  name="IsDailyCaloriesGoal"
                  value="monthly"
                  checked={caloriesOption === 'monthly'}
                  onChange={handleChange}
                />
              </div>
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <Form.Group controlId="dailyCalories">
              <Form.Label>Daily Calories Goal</Form.Label>
              <Form.Control
                type="number"
                name="dailyCalories"
                value={goals.dailyCalories}
                onChange={handleChange}
                disabled={caloriesOption !== 'daily'}
                className={caloriesOption === 'daily' ? '' : "disabled-input"}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="monthlyCalories">
              <Form.Label>Monthly Calories Goal</Form.Label>
              <Form.Control
                type="number"
                name="monthlyCalories"
                value={goals.monthlyCalories}
                onChange={handleChange}
                disabled={caloriesOption !== 'monthly'}
                className={caloriesOption === 'monthly' ? '' : "disabled-input"}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <Form.Group controlId="currentWeight">
              <Form.Label>Current Weight (kg)</Form.Label>
              <Form.Control
                type="number"
                name="currentWeight"
                value={goals.currentWeight}
                onChange={handleChange}
                placeholder="Enter current weight"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="goalWeight">
              <Form.Label>Goal Weight (kg)</Form.Label>
              <Form.Control
                type="number"
                name="goalWeight"
                value={goals.goalWeight}
                onChange={handleChange}
                placeholder="Enter goal weight"
              />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <Form.Group controlId="height">
              <Form.Label>Height (cm)</Form.Label>
              <Form.Control
                type="number"
                name="height"
                value={goals.height}
                onChange={handleChange}
                placeholder="Enter height"
              />
            </Form.Group>
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
