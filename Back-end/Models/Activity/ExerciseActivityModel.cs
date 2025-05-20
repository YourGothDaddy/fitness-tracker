namespace Fitness_Tracker.Models.Activity
{
    using Fitness_Tracker.Data.Models.Enums;

    public class ExerciseActivityModel
    {
        public string Name { get; set; }
        public int DurationInMinutes { get; set; }
        public int CaloriesBurned { get; set; }
        public TimeOfTheDay TimeOfDay { get; set; }
        public TimeSpan Time { get; set; }
    }
} 