namespace Fitness_Tracker.Models.Activity
{
    public class ActivityTypeModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Category { get; set; }
        public bool IsPublic { get; set; }
        public string? CreatedByUserId { get; set; }
        public int? Calories { get; set; }
    }
} 