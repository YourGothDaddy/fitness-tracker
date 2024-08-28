import React, { useEffect, useState } from 'react';
import '../../css/AllMealsPage.css';

const AllMealsPage = () => {
    const [meals, setMeals] = useState([]);
    const [calories, setCalories] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        fetchMeals();
        fetchCalories();
    }, [selectedDate]);

    const fetchMeals = async () => {
        try {
            const data = await fetchData(`https://localhost:7009/api/meal/all?date=${formatDate(selectedDate)}`);
            setMeals(data);
            setErrorMessage('');
        } catch (err) {
            setErrorMessage(err.message);
        }
    };

    const fetchCalories = async () => {
        try {
            const data = await fetchData(`https://localhost:7009/api/meal/calories?date=${formatDate(selectedDate)}`);
            setCalories(data);
            setErrorMessage('');
        } catch (err) {
            setErrorMessage(err.message);
        }
    };

    const fetchData = async (url) => {
        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Fetching data failed');
        }

        return response.json();
    };

    const formatDate = (date) => {
        return date.toISOString().split('T')[0];
    };

    const handlePreviousDay = () => {
        updateSelectedDate(-1);
    };

    const handleNextDay = () => {
        if (!isToday(selectedDate)) {
            updateSelectedDate(1);
        }
    };

    const updateSelectedDate = (days) => {
        setSelectedDate((prevDate) => {
            const newDate = new Date(prevDate);
            newDate.setDate(prevDate.getDate() + days);
            return newDate;
        });
    };

    const isToday = (date) => {
        return date.toDateString() === new Date().toDateString();
    };

    return (
        <div className="all-meals-container">
            {errorMessage && <p className="error-message">{errorMessage}</p>}

            <DateNavigation
                selectedDate={selectedDate}
                onPreviousDay={handlePreviousDay}
                onNextDay={handleNextDay}
                isToday={isToday(selectedDate)}
            />

            <MealTable meals={meals} />

            <h1>Total calories: {calories}</h1>
        </div>
    );
};

const DateNavigation = ({ selectedDate, onPreviousDay, onNextDay, isToday }) => (
    <div className="date-navigation">
        <button onClick={onPreviousDay}>←</button>
        <span>{selectedDate.toDateString()}</span>
        <button onClick={onNextDay} disabled={isToday}>→</button>
    </div>
);

const MealTable = ({ meals }) => (
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
);

const MealOfTheDayLabel = (mealOfTheDay) => {
    const mealLabels = {
        0: 'Breakfast',
        1: 'Lunch',
        2: 'Dinner',
        3: 'Snack',
    };
    return mealLabels[mealOfTheDay] || 'Unknown';
};

export default AllMealsPage;
