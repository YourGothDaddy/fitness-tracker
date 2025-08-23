namespace Fitness_Tracker.Models.Users
{
    using Fitness_Tracker.Data.Models;
    using Fitness_Tracker.Data.Models.Enums;
    using System.ComponentModel.DataAnnotations;

    public class RegisterModel
    {
        [Required]
        [StringLength(100, MinimumLength = 2)]
        public string FullName { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 6)]
        public string Password { get; set; }
        [Required]
        public Gender Gender { get; set; }
        [Required]
        public float Weight { get; set; }
        [Required]
        public float Height { get; set; }
        [Required]
        public int Age { get; set; }
        [Required]
        public int ActivityLevelId { get; set; }
        public float? WeeklyWeightChangeGoal { get; set; }
        public float? GoalWeight { get; set; }

    }
}
