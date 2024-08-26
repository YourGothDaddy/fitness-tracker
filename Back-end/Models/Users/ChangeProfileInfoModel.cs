namespace Fitness_Tracker.Models.Users
{
    using System.ComponentModel.DataAnnotations;

    public class ChangeProfileInfoModel
    {
        [Required]
        public string Email { get; set; }
    }
}
