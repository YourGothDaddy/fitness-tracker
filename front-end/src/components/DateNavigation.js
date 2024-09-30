import React from "react";
import "../css/DateNavigation.css";

const DateNavigation = ({
  selectedDate,
  onPreviousDay,
  onNextDay,
  isToday,
  onDateClick,
}) => {
  const formattedDate = selectedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="date-navigation">
      <button onClick={onPreviousDay}>←</button>
      <span onClick={onDateClick} style={{ cursor: "pointer" }}>
        {formattedDate}
      </span>
      <button onClick={onNextDay} disabled={isToday}>
        →
      </button>
    </div>
  );
};

export default DateNavigation;
