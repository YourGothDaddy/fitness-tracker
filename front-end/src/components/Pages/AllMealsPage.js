import React, { useEffect, useState } from 'react';
import '../../css/AllMealsPage.css';

const AllMealsPage = () => {
    const [meals, setMeals] = useState([]);
    const [calories, setCalories] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const fetchMeals = async () => {
            try {
                const response = await fetch('https://localhost:7009/api/meal/all', {
                    method: 'POST',
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error('Displaying meals failed');
                }

                const data = await response.json();
                setMeals(data);
                setErrorMessage('');
            } catch (err) {
                setErrorMessage(err.message);
            }
        };

        fetchMeals();
    }, []);

    useEffect(() => {
        const fetchCalories = async () => {
            try {
                const response = await fetch('https://localhost:7009/api/meal/calories', {
                    method: 'POST',
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error('Displaying calories failed');
                }

                const data = await response.json();
                setCalories(data);
                setErrorMessage('');
            } catch (err) {
                setErrorMessage(err.message);
            }
        };

        fetchCalories();
    }, []);

    return (
        <div className="all-meals-container">
            {errorMessage && <p className="error-message">{errorMessage}</p>}

            <div className="table-wrapper">
                <table className="meals-table">
                    <thead>
                        <tr>
                            <th>Meal Name</th>
                            <th>Meal of the Day</th>
                            <th>Calories</th>
                        </tr>
                    </thead>
                    <tbody>
                        {meals.map((meal) => (
                            <tr key={meal.id}>
                                <td>{meal.name}</td>
                                <td>{MealOfTheDayLabel(meal.mealOfTheDay)}</td>
                                <td>{meal.calories}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <h1>Total calories: {calories}</h1>
        </div>
    );
};

const MealOfTheDayLabel = (mealOfTheDay) => {
    switch (mealOfTheDay) {
        case 0:
            return 'Breakfast';
        case 1:
            return 'Lunch';
        case 2:
            return 'Dinner';
        case 3:
            return 'Snack';
        default:
            return 'Unknown';
    }
};

export default AllMealsPage;
