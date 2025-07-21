namespace Fitness_Tracker.Data.Models
{
    public class ActivityType
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int ActivityCategoryId { get; set; }
        public ActivityCategory ActivityCategory { get; set; }
        public ICollection<Activity> Activities { get; set; } = new List<Activity>();
        public bool IsPublic { get; set; } = false;
        public string? CreatedByUserId { get; set; }
        public int? Calories { get; set; } // For custom workouts
    }
}
