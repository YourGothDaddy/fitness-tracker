import React, { useState, useEffect, useCallback } from "react";
import InfoCard from "../Cards/InfoCard.js";
import AddMealForm from "../Forms/AddMealForm.js";
import AllMealsPage from "../Tables/AllMealsTable.js";
import InfoCardPieChart from "../Cards/InfoCardPieChart.js";
import "../../css/DashboardPage.css";

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
  const [errorMessage, setErrorMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [fetchMealsFn, setFetchMealsFn] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const fetchData = useCallback(async (url) => {
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Fetching data failed");
    }

    return response.json();
  }, []);

  const fetchUserDataAndGoals = useCallback(async () => {
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
      setErrorMessage("");
    } catch (err) {
      setErrorMessage(err.message);
    }
  }, [fetchData]);

  const fetchCalories = useCallback(async () => {
    try {
      const data = await fetchData(
        `https://localhost:7009/api/meal/calories?date=${formatDate(
          selectedDate
        )}`
      );
      setCalories(data);
      setErrorMessage("");
    } catch (err) {
      setErrorMessage(err.message);
    }
  }, [fetchData, selectedDate]);

  useEffect(() => {
    fetchUserDataAndGoals();
    fetchCalories();
  }, [fetchUserDataAndGoals, fetchCalories]);

  const handleAddMeal = useCallback(() => {
    fetchCalories();
    fetchMealsFn?.();
  }, [fetchCalories, fetchMealsFn]);

  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  const { dailyCalories, currentWeight, goalWeight } = userDataAndGoals;

  return (
    <div className="dashboard-container">
      <div className="dashboard-page">
        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <AddMealForm onAddMeal={handleAddMeal} />
            </div>
          </div>
        )}

        <div className="upper-section">
          <AllMealsPage
            setFetchMealsFn={setFetchMealsFn}
            setSelectedDateToDashboard={setSelectedDate}
            setShowForm={setShowForm}
          />
        </div>
        {errorMessage && <h1>{errorMessage}</h1>}
        <div className="main-section">
          <div className="left-section">
            <InfoCardPieChart
              current={calories}
              goal={dailyCalories}
              unit="kcal"
            />{" "}
            <InfoCardPieChart
              current={calories}
              goal={dailyCalories}
              unit="kcal"
            />
            <InfoCardPieChart
              current={calories}
              goal={dailyCalories}
              unit="kcal"
            />
          </div>
          <div className="right-section">
            <InfoCard current={currentWeight} goal={goalWeight} unit="kg" />
            <InfoCard current={currentWeight} goal={goalWeight} unit="kg" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
