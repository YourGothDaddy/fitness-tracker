namespace Fitness_Tracker.Models.Activity
{
    using System;

    public class TrackExerciseRequest
    {
        public string Category { get; set; }
        public string Subcategory { get; set; }
        public string? Exercise { get; set; }
        public string EffortLevel { get; set; } // e.g., "Moderate"
        public int DurationInMinutes { get; set; }
        public string? TerrainType { get; set; } // optional, e.g., "Moderate incline"
        public DateTime Date { get; set; }
        public bool? IsPublic { get; set; }
        public string? Notes { get; set; }
    }
} 