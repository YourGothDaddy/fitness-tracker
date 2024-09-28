import React from "react";
import "../../css/InfoCard.css";

const InfoCard = ({ current, goal, unit }) => {
  const difference = current - goal;
  const percentage = goal ? (current / goal) * 100 : 100;
  const isAboveGoal = current > goal;

  const getProgressColor = () => {
    if (percentage > 100) return "#e57373"; // Red for over the goal
    if (percentage > 75) return "#ffb74d"; // Orange for close to goal
    return "#81c784"; // Green for on or under the goal
  };

  return (
    <div className="info-card">
      <div className="weight-content">
        <div className="weight-value">
          {current} {unit}
        </div>
        <div className="goal-status">
          <span className={isAboveGoal ? "above-goal" : "below-goal"}>
            {isAboveGoal ? "Over by" : "Under by"} {Math.abs(difference)} {unit}
          </span>
        </div>
      </div>
      <div className="progress-bar">
        <div
          className="progress"
          style={{
            width: `${Math.min(percentage, 100)}%`,
            backgroundColor: getProgressColor(),
          }}
        ></div>
      </div>
      <div className="motivational-text">
        {isAboveGoal
          ? "Keep going! You're almost there!"
          : "Great progress! Keep it up!"}
      </div>
    </div>
  );
};

export default InfoCard;
