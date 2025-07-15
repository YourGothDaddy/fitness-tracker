namespace Fitness_Tracker.Models.Activity
{
    using System.Collections.Generic;

    public class ExerciseMetaDataModel
    {
        public string Category { get; set; }
        public string Subcategory { get; set; }
        public List<string> EffortLevels { get; set; } = new List<string>();
        public List<string> TerrainTypes { get; set; } = new List<string>();
        public float CaloriesPerMinute { get; set; }
        public float CaloriesPerHalfHour { get; set; }
        public float CaloriesPerHour { get; set; }
    }

    public class CalculateExerciseCaloriesRequest
    {
        public string Category { get; set; }
        public string Subcategory { get; set; }
        public string EffortLevel { get; set; } // e.g., "Moderate"
        public int DurationInMinutes { get; set; }
        public string? TerrainType { get; set; } // optional, e.g., "Moderate incline"
    }

    public class CalculateExerciseCaloriesResponse
    {
        public float CaloriesPerMinute { get; set; }
        public float CaloriesPerHalfHour { get; set; }
        public float CaloriesPerHour { get; set; }
        public float TotalCalories { get; set; }
    }
} 