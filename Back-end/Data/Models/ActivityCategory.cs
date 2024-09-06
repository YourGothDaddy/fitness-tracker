namespace Fitness_Tracker.Data.Models
{
    public class ActivityCategory
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public ICollection<ActivityType> ActivityTypes { get; set; } = new List<ActivityType>();
    }
}
