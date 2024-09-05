import React from "react";
import "../css/DateNavigation.css";

const DateNavigation = ({
  selectedDate,
  onPreviousDay,
  onNextDay,
  isToday,
}) => (
  <div className="date-navigation">
    <button onClick={onPreviousDay}>←</button>
    <span>{selectedDate.toDateString()}</span>
    <button onClick={onNextDay} disabled={isToday}>
      →
    </button>
  </div>
);

export default DateNavigation;
