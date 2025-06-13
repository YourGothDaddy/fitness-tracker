using System.ComponentModel.DataAnnotations;

namespace Fitness_Tracker.Models.Users
{
    public class UpdateProfileModel
    {
        [Required]
        public string FullName { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        public string PhoneNumber { get; set; }
    }
} 