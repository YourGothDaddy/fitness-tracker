namespace Fitness_Tracker.Models.Users
{
    using System.ComponentModel.DataAnnotations;

    public class ResetPasswordRequest
    {
        [Required]
        public string Token { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [MinLength(6)]
        public string NewPassword { get; set; }
    }
}


