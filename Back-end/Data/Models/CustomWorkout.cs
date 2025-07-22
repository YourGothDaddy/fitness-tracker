using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Fitness_Tracker.Data.Models
{
    public class CustomWorkout
    {
        public int Id { get; set; }

        [Required]
        public string UserId { get; set; }
        public User User { get; set; }

        [Required]
        public string Name { get; set; }

        [Required]
        public int ActivityCategoryId { get; set; }
        public ActivityCategory ActivityCategory { get; set; }

        [Required]
        public int ActivityTypeId { get; set; }
        public ActivityType ActivityType { get; set; }

        [Required]
        public int DurationInMinutes { get; set; }

        [Required]
        public int CaloriesBurned { get; set; }

        // Optionally, add notes or other fields as needed
        public string? Notes { get; set; }
    }
} 