namespace Fitness_Tracker.Models.Activity
{
    using System.Collections.Generic;

    public class ExerciseMetaDataModel
    {
        public string Category { get; set; }
        public string Subcategory { get; set; }
        public string? Exercise { get; set; } // Optional third level
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
        public string? Exercise { get; set; }
        public string EffortLevel { get; set; } // e.g., "Moderate"
        public int DurationInMinutes { get; set; }
        public string? TerrainType { get; set; } // optional, e.g., "Moderate incline"
    }

    public class ActivityExerciseVariantModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public List<string> Keys { get; set; } = new List<string>(); // Effort keys or terrain keys
    }

    public class CalculateExerciseCaloriesResponse
    {
        public float CaloriesPerMinute { get; set; }
        public float CaloriesPerHalfHour { get; set; }
        public float CaloriesPerHour { get; set; }
        public float TotalCalories { get; set; }
    }
} 