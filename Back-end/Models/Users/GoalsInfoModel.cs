namespace Fitness_Tracker.Models.Users
{
    using System.ComponentModel.DataAnnotations;

    public class GoalsInfoModel
    {
        [Required]
        public int DailyCaloriesGoal { get; set; }

        [Required]
        public int MonthlyCaloriesGoal { get; set; }

        [Required]
        public float Weight { get; set; }

        [Required]
        public float GoalWeight { get; set; }

        [Required]
        public float Height { get; set; }

        [Required]
        public bool IsDailyCaloriesGoal { get; set; }
    }
}
