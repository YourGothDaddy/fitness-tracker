namespace Fitness_Tracker.Models.Users
{
    public class GoalsInfoModel
    {
        public int DailyCaloriesGoal { get; set; }

        public int MonthlyCaloriesGoal { get; set; }

        public float Weight { get; set; }

        public float GoalWeight { get; set; }

        public float Height { get; set; }

        public bool IsDailyCaloriesGoal { get; set; }
    }
}
