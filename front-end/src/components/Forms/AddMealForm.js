import React, { useState } from 'react';
import '../../css/AddMealForm.css';
import { Form, Button, Container } from 'react-bootstrap';

const AddMealForm = () => {
    const [name, setName] = useState('');
    const [mealOfTheDay, setMealOfTheDay] = useState(0);
    const [calories, setCalories] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const mealOfTheDayAsInt = parseInt(mealOfTheDay);
        try {
            const response = await fetch('https://localhost:7009/api/meal/add', {
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
            setErrorMessage('Success');
          } catch (err) {
            setErrorMessage(err.message);
          }

          setName('');
          setMealOfTheDay(0);
          setCalories(0);
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
            <Button type="submit" className="fancy-button">
              Add Meal
            </Button>
          </Form>
        </Container>
      );
};

export default AddMealForm;
