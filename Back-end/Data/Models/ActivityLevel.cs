namespace Fitness_Tracker.Data.Models
{
    public class ActivityLevel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public double Multiplier { get; set; }

        public ICollection<User> Users { get; set; } = new List<User>();
    }
}
