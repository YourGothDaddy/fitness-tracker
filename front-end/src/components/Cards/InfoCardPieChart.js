// InfoCardPieChart.js
import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import "../../css/InfoCardPieChart.css";

ChartJS.register(ArcElement, Tooltip, Legend);

const InfoCardPieChart = ({ title, current, goal, unit }) => {
  const remaining = goal - current;
  const isAboveGoal = current > goal;

  // Data for Pie Chart
  const data = {
    labels: ["Consumed", "Remaining"],
    datasets: [
      {
        data: [current, remaining > 0 ? remaining : 0], // Ensure no negative values
        backgroundColor: [isAboveGoal ? "#e57373" : "#81c784", "#f3f3f3"], // Colors: Red if over goal, Green otherwise
        hoverBackgroundColor: [isAboveGoal ? "#ef9a9a" : "#a5d6a7", "#e0e0e0"],
      },
    ],
  };

  // Options for Pie Chart
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const label = tooltipItem.label || "";
            const value = tooltipItem.raw;
            return `${label}: ${value} ${unit}`;
          },
        },
      },
    },
  };

  return (
    <div className="info-card-pie-chart">
      <h3>{title}</h3>
      <div className="pie-chart-container">
        <Pie data={data} options={options} />
      </div>
      <div className="goal-status">
        <span className={isAboveGoal ? "above-goal" : "below-goal"}>
          {isAboveGoal ? (
            <>
              Over goal by <br />
              {Math.abs(remaining)} {unit}
            </>
          ) : (
            `${Math.abs(current)} ${unit}`
          )}
        </span>
      </div>
      <div className="motivational-text">
        {isAboveGoal
          ? "Keep going! You're almost there!"
          : "Great progress! Keep it up!"}
      </div>
    </div>
  );
};

export default InfoCardPieChart;
