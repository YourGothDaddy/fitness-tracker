namespace Fitness_Tracker.Models.Meals
{
    using Fitness_Tracker.Data.Models.Enums;
    using System.ComponentModel.DataAnnotations;

    public class AddMealModel
    {
        [Required]
        public string Name { get; set; }

        [Required]
        public MealOfTheDay MealOfTheDay { get; set; }

        [Required]
        public int Calories { get; set; }
    }
}
