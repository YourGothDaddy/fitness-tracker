import React, { useEffect, useState } from 'react';
import '../../css/AllMealsPage.css';

const AllMealsPage = () => {
    const [meals, setMeals] = useState([]);
    const [calories, setCalories] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        const fetchMeals = async () => {
            try {
                const formattedDate = selectedDate.toISOString().split('T')[0];
                const response = await fetch(`https://localhost:7009/api/meal/all?date=${formattedDate}`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
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
    }, [selectedDate]);

    useEffect(() => {
        const fetchCalories = async () => {
            try {
                const formattedDate = selectedDate.toISOString().split('T')[0];
                const response = await fetch(`https://localhost:7009/api/meal/calories?date=${formattedDate}`, {
                    method: 'GET',
                    credentials: 'include'
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
    }, [selectedDate]);

    const handlePreviousDay = () => {
        setSelectedDate(prevDate => {
            const newDate = new Date(prevDate);
            newDate.setDate(prevDate.getDate() - 1);
            return newDate;
        });
    };

    const handleNextDay = () => {
        setSelectedDate(prevDate => {
            const newDate = new Date(prevDate);
            const today = new Date();
            if (newDate.toDateString() !== today.toDateString()) {
                newDate.setDate(prevDate.getDate() + 1);
            }
            return newDate;
        });
    };

    return (
        <div className="all-meals-container">
            {errorMessage && <p className="error-message">{errorMessage}</p>}

            <div className="date-navigation">
                <button onClick={handlePreviousDay}>←</button>
                <span>{selectedDate.toDateString()}</span>
                <button onClick={handleNextDay} disabled={selectedDate.toDateString() === new Date().toDateString()}>→</button>
            </div>

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
