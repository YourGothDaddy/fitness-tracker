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
    }
} 