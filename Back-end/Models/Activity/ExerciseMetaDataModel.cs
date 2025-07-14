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
} 