namespace Fitness_Tracker.Data.Models
{
    using System.ComponentModel.DataAnnotations;

    public class Activity
    {
        public int Id { get; set; }
        
        [Required]
        public int DurationInMinutes { get; set; }
        
        [Required]
        public int CaloriesBurned { get; set; }
        
        [Required]
        public int ActivityTypeId { get; set; }
        
        public ActivityType ActivityType { get; set; }
        
        [Required]
        public DateTime Date { get; set; }
        
        [Required]
        public string UserId { get; set; }
        
        public User User { get; set; }
        
        public bool IsPublic { get; set; } = true;
    }
}
