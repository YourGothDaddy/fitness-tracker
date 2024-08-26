namespace Fitness_Tracker.Data.Models
{
    using Microsoft.AspNetCore.Identity;

    public class User : IdentityUser
    {
        public virtual ICollection<Meal> Meals { get; set; } = new List<Meal>();

        public int DailyCaloriesGoal { get; set; }

        public int MonthlyCaloriesGoal { get; set; }

        public float Weight { get; set; }

        public float GoalWeight { get; set; }

        public float Height { get; set; }

        public bool IsDailyCaloriesGoal { get; set; }

    }
}
