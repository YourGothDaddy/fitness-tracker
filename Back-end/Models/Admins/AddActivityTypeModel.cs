namespace Fitness_Tracker.Models.Admins
{
    public class AddActivityTypeModel
    {
        public string Name { get; set; }

        public int ActivityCategoryId { get; set; }

        public bool IsPublic { get; set; } = false;
        public string? CreatedByUserId { get; set; }
        public int? Calories { get; set; } // For custom workouts
    }
}
