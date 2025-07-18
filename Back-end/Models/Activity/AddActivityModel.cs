namespace Fitness_Tracker.Models.Activity
{
    using Fitness_Tracker.Data.Models.Enums;
    using System.ComponentModel.DataAnnotations;

    public class AddActivityModel
    {
        [Required]
        public int DurationInMinutes { get; set; }

        [Required]
        public TimeOfTheDay TimeOfTheDay { get; set; }

        [Required]
        public int CaloriesBurned { get; set; }

        [Required]
        public int ActivityTypeId { get; set; }

        [Required]
        public DateTime Date { get; set; }

        public string Notes { get; set; }

        public bool IsPublic { get; set; } = true;
    }
} 