namespace Fitness_Tracker.Data.Models
{
    using Microsoft.AspNetCore.Identity;

    public class User : IdentityUser
    {
        public virtual ICollection<Meal> Meals { get; set; } = new List<Meal>();
    }
}
