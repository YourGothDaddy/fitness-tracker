using System.ComponentModel.DataAnnotations;

namespace Fitness_Tracker.Models.Users
{
    public class ProfileModel
    {
        public string FullName { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public int Age { get; set; }
        public string Sex { get; set; }
        public float Weight { get; set; }
        public float Height { get; set; }
        public float BMI { get; set; }
        public float BodyFat { get; set; }
        [Required]
        public int ActivityLevelId { get; set; }
        public bool IncludeTef { get; set; } // Whether to include Thermic Effect of Food
        public string Initials
        {
            get
            {
                if (string.IsNullOrWhiteSpace(FullName)) return "";
                var parts = FullName.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
                if (parts.Length == 0) return "";
                if (parts.Length == 1) return parts[0][0].ToString().ToUpper();
                return (parts[0][0].ToString() + parts[parts.Length - 1][0].ToString()).ToUpper();
            }
        }
    }
} 