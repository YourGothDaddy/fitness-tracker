namespace Fitness_Tracker.Data.Models
{
    public class ExerciseMetProfile
    {
        public int Id { get; set; }

        public int ActivityExerciseId { get; set; }
        public ActivityExercise ActivityExercise { get; set; }

        // For most exercises: effort-style levels (Low/Moderate/Hard) or specific variants like pace ranges
        public string Key { get; set; } // e.g., "Low", "Moderate", "Hard", or "Moderate incline"

        public float Met { get; set; }
    }
}


