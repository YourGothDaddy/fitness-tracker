namespace Fitness_Tracker.Data.Models
{
    using Fitness_Tracker.Data.Models.Enums;

    public class Activity
    {
        public int Id { get; set; }
        public int DurationInMinutes { get; set; }
        public TimeOfTheDay TimeOfTheDay { get; set; }
        public int CaloriesBurned { get; set; }
        public int ActivityTypeId { get; set; }
        public ActivityType ActivityType { get; set; }
    }
}
