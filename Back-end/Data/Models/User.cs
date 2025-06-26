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
        public virtual ICollection<Activity> Activities { get; set; } = new List<Activity>();

        public int DailyCaloriesGoal { get; set; }

        public int MonthlyCaloriesGoal { get; set; }

        public int DailyProteinGoal { get; set; }

        public float GoalWeight { get; set; }

        public bool IsDailyCaloriesGoal { get; set; }

        public ICollection<RefreshToken> RefreshTokens { get; set; }

        public bool NotificationsEnabled { get; set; } = true; // Default to true

        public MacroMode MacroMode { get; set; } = MacroMode.Ratios; // Default to Ratios
        public int ProteinRatio { get; set; } = 30; // Percent, for Ratios mode
        public int CarbsRatio { get; set; } = 40; // Percent, for Ratios mode
        public int FatRatio { get; set; } = 30; // Percent, for Ratios mode
        public int ProteinKcal { get; set; } = 0; // For Fixed mode
        public int CarbsKcal { get; set; } = 0; // For Fixed mode
        public int FatKcal { get; set; } = 0; // For Fixed mode

        public virtual ICollection<UserNutrientTarget> UserNutrientTargets { get; set; } = new List<UserNutrientTarget>();
    }
}
