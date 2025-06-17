using System.ComponentModel.DataAnnotations;

namespace Fitness_Tracker.Models.Users
{
    public class UpdateGoalsModel
    {
        [Required]
        [Range(0, int.MaxValue, ErrorMessage = "Daily calories goal must be a positive number")]
        public int DailyCaloriesGoal { get; set; }

        [Required]
        [Range(0, int.MaxValue, ErrorMessage = "Daily protein goal must be a positive number")]
        public int DailyProteinGoal { get; set; }
    }
} 