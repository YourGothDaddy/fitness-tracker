using System.ComponentModel.DataAnnotations;

namespace Fitness_Tracker.Models.Users
{
    public class UpdateNotificationsModel
    {
        [Required]
        public bool NotificationsEnabled { get; set; }
    }
} 