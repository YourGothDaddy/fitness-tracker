namespace Fitness_Tracker.Models.Users
{
    using System.ComponentModel.DataAnnotations;

    public class ForgotPasswordRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }
    }
}


