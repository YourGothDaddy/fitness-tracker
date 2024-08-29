import React, { useState, useEffect } from 'react';
import InfoCard from '../InfoCard.js';
import '../../css/DashboardPage.css';

const DashboardPage = () => {
    const [userDataAndGoals, setUserDataAndGoals] = useState({
        dailyCalories: 0,
        monthlyCalories: 0,
        currentWeight: 0,
        goalWeight: 0,
        height: 0,
        isDailyCaloriesGoal: true,
    });
    const [calories, setCalories] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        fetchUserDataAndGoals();
        fetchCalories();
    }, []);

    const fetchUserDataAndGoals = async () => {
        try {
            const data = await fetchData(`https://localhost:7009/api/user/goals`);
            setUserDataAndGoals({
                dailyCalories: data.dailyCaloriesGoal || 0,
                monthlyCalories: data.monthlyCaloriesGoal || 0,
                currentWeight: data.weight || 0,
                goalWeight: data.goalWeight || 0,
                height: data.height || 0,
                isDailyCaloriesGoal: data.isDailyCaloriesGoal,
            });
            setErrorMessage('');
        } catch (err) {
            setErrorMessage(err.message);
        }
    };

    const fetchCalories = async () => {
        try {
            const data = await fetchData(`https://localhost:7009/api/meal/calories?date=${formatDate(new Date())}`);
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

    const {
        dailyCalories,
        monthlyCalories,
        currentWeight,
        goalWeight,
        height,
    } = userDataAndGoals;

    return (
        <div className="dashboard-page">
            <h1>Your Fitness Dashboard</h1>
            {errorMessage && (
                <div className="alert alert-danger" role="alert">
                    {errorMessage}
                </div>
            )}
            <div className="dashboard-grid">
                <InfoCard
                    title="Calories Consumed Today"
                    current={calories}
                    goal={dailyCalories}
                    unit="kcal"
                />
                <InfoCard
                    title="Current Weight"
                    current={currentWeight}
                    goal={goalWeight}
                    unit="kg"
                />
            </div>
        </div>
    );
};

export default DashboardPage;
