using System;

namespace Fitness_Tracker.Models.Nutrition
{
    public class EnergyExpenditureModel
    {
        public double BMR { get; set; }
        public double ExerciseCalories { get; set; }
        public double BaselineActivityCalories { get; set; }
        public double TEFCalories { get; set; }
        public double TotalEnergyBurned { get; set; }
        public double BMRPercentage { get; set; }
        public double ExercisePercentage { get; set; }
        public double BaselineActivityPercentage { get; set; }
        public double TEFPercentage { get; set; }
    }
} 