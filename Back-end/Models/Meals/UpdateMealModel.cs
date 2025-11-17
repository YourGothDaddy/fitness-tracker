namespace Fitness_Tracker.Models.Meals
{
    using Fitness_Tracker.Data.Models.Enums;
    using System.ComponentModel.DataAnnotations;

    /// <summary>
    /// Model used for updating an existing meal entry.
    /// All fields are optional; only supplied values will be updated.
    /// </summary>
    public class UpdateMealModel
    {
        [StringLength(200)]
        public string? Name { get; set; }

        public MealOfTheDay? MealOfTheDay { get; set; }

        public int? Calories { get; set; }

        public double? Protein { get; set; }

        public double? Carbs { get; set; }

        public double? Fat { get; set; }

        public DateTime? Date { get; set; }
    }
}


