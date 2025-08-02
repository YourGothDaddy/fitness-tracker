using System.ComponentModel.DataAnnotations;

namespace Fitness_Tracker.Models.Users
{
    public class WeightGoalModel
    {
        [Required]
        [Range(30, 300, ErrorMessage = "Current weight must be between 30 and 300 kg")]
        public float CurrentWeight { get; set; }

        [Required]
        [Range(30, 300, ErrorMessage = "Goal weight must be between 30 and 300 kg")]
        public float GoalWeight { get; set; }

        [Required]
        [Range(-2.0, 2.0, ErrorMessage = "Weight change per week must be between -2.0 and 2.0 kg")]
        public float WeightChangePerWeek { get; set; }
    }
} 