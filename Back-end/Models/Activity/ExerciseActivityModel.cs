namespace Fitness_Tracker.Models.Activity
{
    public class ExerciseActivityModel
    {
        public string Name { get; set; }
        public int DurationInMinutes { get; set; }
        public int CaloriesBurned { get; set; }
        public TimeSpan Time { get; set; }
        public string Category { get; set; }
    }
} 