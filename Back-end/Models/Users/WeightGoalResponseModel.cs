namespace Fitness_Tracker.Models.Users
{
    public class WeightGoalResponseModel
    {
        public float CurrentWeight { get; set; }
        public float GoalWeight { get; set; }
        public float WeightChangePerWeek { get; set; }
        public DateTime ForecastDate { get; set; }
        public int AdjustedCalorieTarget { get; set; }
        public int WeeksToGoal { get; set; }
        public float TotalWeightChange { get; set; }
        public int CalorieDeficit { get; set; }
    }
} 