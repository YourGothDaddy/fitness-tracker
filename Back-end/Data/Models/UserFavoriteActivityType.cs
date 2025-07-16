using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Fitness_Tracker.Data.Models
{
    public class UserFavoriteActivityType
    {
        [Key, Column(Order = 0)]
        public string UserId { get; set; }
        public User User { get; set; }

        [Key, Column(Order = 1)]
        public int ActivityTypeId { get; set; }
        public ActivityType ActivityType { get; set; }
    }
} 