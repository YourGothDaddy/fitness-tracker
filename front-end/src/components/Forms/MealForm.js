import React, { useState } from 'react';
import 'react-bootstrap';

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
        <div className="container mt-5">
            <div className="card shadow-lg">
                <div className="card-header bg-primary text-white">
                    <h3>Add a New Meal</h3>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        {errorMessage && (
                            <div className="alert alert-danger" role="alert">
                                {errorMessage}
                            </div>
                        )}
                        <div className="mb-3">
                            <label htmlFor="mealName" className="form-label">
                                Meal Name
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                id="mealName"
                                placeholder="Enter meal name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="mealType" className="form-label">
                                Meal Type
                            </label>
                            <select
                                className="form-select"
                                id="mealType"
                                value={mealOfTheDay}
                                onChange={(e) => setMealOfTheDay(e.target.value)}
                            >
                                <option value="0">Breakfast</option>
                                <option value="1">Lunch</option>
                                <option value="2">Dinner</option>
                                <option value="3">Snack</option>
                            </select>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="calories" className="form-label">
                                Calories
                            </label>
                            <input
                                type="number"
                                className="form-control"
                                id="calories"
                                placeholder="Enter calories"
                                value={calories}
                                onChange={(e) => setCalories(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary w-100">
                            Add Meal
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddMealForm;
