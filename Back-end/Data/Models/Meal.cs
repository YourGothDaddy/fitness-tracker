namespace Fitness_Tracker.Data.Models
{
    using Fitness_Tracker.Data.Models.Enums;
    using System.ComponentModel.DataAnnotations;

    public class Meal
    {
        public int Id { get; set; }

        [Required]
        public MealOfTheDay MealOfTheDay { get; set; }

        [Required]
        public string Name { get; set; }

        [Required]
        public int Calories { get; set; }

        [Required]
        public double Protein { get; set; }

        [Required]
        public double Carbs { get; set; }

        [Required]
        public double Fat { get; set; }

        [Required]
        public string UserId { get; set; }

        public virtual User User { get; set; }

        [Required]
        public DateTime Date { get; set; }
    }
}