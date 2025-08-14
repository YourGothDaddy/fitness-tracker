namespace Fitness_Tracker.Data.Models
{
    using System.Collections.Generic;

    public class ActivityExercise
    {
        public int Id { get; set; }
        public string Name { get; set; }

        public int ActivityTypeId { get; set; }
        public ActivityType ActivityType { get; set; }

        public bool IsPublic { get; set; } = true;
        public string? CreatedByUserId { get; set; }

        public ICollection<ExerciseMetProfile> MetProfiles { get; set; } = new List<ExerciseMetProfile>();
    }
}


