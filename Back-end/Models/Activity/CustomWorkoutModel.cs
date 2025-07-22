namespace Fitness_Tracker.Models.Activity
{
    public class CustomWorkoutModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int ActivityCategoryId { get; set; }
        public int ActivityTypeId { get; set; }
        public int DurationInMinutes { get; set; }
        public int CaloriesBurned { get; set; }
        public string? Notes { get; set; }
    }
} 