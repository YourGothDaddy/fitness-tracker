import React, { useEffect, useState, useCallback } from "react";
import DatePicker from "react-datepicker";
import DateNavigation from "../DateNavigation";
import "react-datepicker/dist/react-datepicker.css";
import "../../css/AllMealsTable.css";

const AllMealsPage = ({
  setSelectedDateToDashboard,
  setShowForm,
  refreshMeals,
}) => {
  const [meals, setMeals] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const fetchMeals = useCallback(async () => {
    try {
      const data = await fetchData(
        `https://localhost:7009/api/meal/all?date=${formatDate(selectedDate)}`
      );
      setMeals(data);
      setErrorMessage("");
    } catch (err) {
      setErrorMessage(err.message);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchMeals();
    fetchCalories();
    setSelectedDateToDashboard(selectedDate);
  }, [selectedDate, refreshMeals, fetchMeals, setSelectedDateToDashboard]);

  const fetchCalories = async () => {
    try {
      const data = await fetchData(
        `https://localhost:7009/api/meal/calories?date=${formatDate(
          selectedDate
        )}`
      );
      setErrorMessage("");
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  const fetchData = async (url) => {
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
  };

  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
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

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setIsDatePickerOpen(false);
  };

  const toggleDatePicker = () => {
    setIsDatePickerOpen(!isDatePickerOpen);
  };

  return (
    <div className="all-meals-container">
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <div className="button-section">
        <button className="add-button" onClick={() => setShowForm(true)}>
          Add
        </button>
      </div>
      <DateNavigation
        selectedDate={selectedDate}
        onPreviousDay={handlePreviousDay}
        onNextDay={handleNextDay}
        isToday={isToday(selectedDate)}
        onDateClick={toggleDatePicker}
      />
      <div className="date-picker-wrapper">
        {isDatePickerOpen && (
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            inline
          />
        )}
      </div>

      <MealTable meals={meals} />
    </div>
  );
};

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
    0: "Breakfast",
    1: "Lunch",
    2: "Dinner",
    3: "Snack",
  };
  return mealLabels[mealOfTheDay] || "Unknown";
};

export default AllMealsPage;
