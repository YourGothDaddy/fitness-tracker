import React, { useState } from 'react';
import '../../css/AddMealForm.css';
import { Form, Button, Container } from 'react-bootstrap';

const AddMealForm = () => {
  const [name, setName] = useState('');
  const [mealOfTheDay, setMealOfTheDay] = useState('');
  const [calories, setCalories] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    if (!name.trim()) {
      setErrorMessage('Meal name is required.');
      return false;
    }
    if (mealOfTheDay === '') {
      setErrorMessage('Please select a meal type.');
      return false;
    }
    if (calories <= 0) {
      setErrorMessage('Calories must be a positive number.');
      return false;
    }
    setErrorMessage('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    const mealOfTheDayAsInt = parseInt(mealOfTheDay);

    try {
      const response = await fetch('https://localhost:7009/api/meal/add-meal', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, mealOfTheDay: mealOfTheDayAsInt, calories }),
      });

      if (!response.ok) {
        throw new Error('Adding a meal failed');
      }

      setSuccessMessage('Meal added successfully!');
      setName('');
      setMealOfTheDay('');
      setCalories('');
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="add-meal-form">
      <h2>Add a New Meal</h2>
      <Form onSubmit={handleSubmit} className="meal-form">
        {errorMessage && (
          <div className="alert alert-danger" role="alert">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="alert alert-success" role="alert">
            {successMessage}
          </div>
        )}
        <Form.Group controlId="mealName" className="mb-3">
          <Form.Label>Meal Name</Form.Label>
          <Form.Control
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter meal name"
          />
        </Form.Group>
        <Form.Group controlId="mealType" className="mb-3">
          <Form.Label>Meal Type</Form.Label>
          <Form.Select
            value={mealOfTheDay}
            onChange={(e) => setMealOfTheDay(e.target.value)}
          >
            <option value="">Select meal type</option>
            <option value="0">Breakfast</option>
            <option value="1">Lunch</option>
            <option value="2">Dinner</option>
            <option value="3">Snack</option>
          </Form.Select>
        </Form.Group>
        <Form.Group controlId="calories" className="mb-3">
          <Form.Label>Calories</Form.Label>
          <Form.Control
            type="number"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            placeholder="Enter calories"
          />
        </Form.Group>
        <Button type="submit" className="fancy-button" disabled={isLoading}>
          {isLoading ? 'Adding...' : 'Add Meal'}
        </Button>
      </Form>
    </Container>
  );
};

export default AddMealForm;
