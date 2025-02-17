namespace Fitness_Tracker.Data.Models
{
    using Fitness_Tracker.Data.Models.Enums;
    using Microsoft.AspNetCore.Identity;

    public class User : IdentityUser
    {
        public string FullName { get; set; }
        public Gender Gender { get; set; }
        public float Weight { get; set; }
        public float Height { get; set; }
        public int Age { get; set; }
        public int ActivityLevelId { get; set; }
        public ActivityLevel ActivityLevel { get; set; }
        public float WeeklyWeightChangeGoal { get; set; }
        public virtual ICollection<Meal> Meals { get; set; } = new List<Meal>();

        public int DailyCaloriesGoal { get; set; }

        public int MonthlyCaloriesGoal { get; set; }


        public float GoalWeight { get; set; }


        public bool IsDailyCaloriesGoal { get; set; }

    }
}
