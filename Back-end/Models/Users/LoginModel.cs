﻿namespace Fitness_Tracker.Models.Users
{
    using System.ComponentModel.DataAnnotations;

    public class LoginModel
    {
        [Required]
        public string Email { get; set; }

        [Required]
        public string Password { get; set; }

        public string IpAddress { get; set; }
    }
}
