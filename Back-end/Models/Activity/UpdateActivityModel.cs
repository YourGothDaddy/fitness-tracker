namespace Fitness_Tracker.Models.Activity
{
    using System.ComponentModel.DataAnnotations;

    /// <summary>
    /// Model used for updating an existing activity (exercise) entry.
    /// All fields are optional; only supplied values will be updated.
    /// </summary>
    public class UpdateActivityModel
    {
        public int? DurationInMinutes { get; set; }

        public int? CaloriesBurned { get; set; }

        public DateTime? Date { get; set; }

        public bool? IsPublic { get; set; }
    }
}


