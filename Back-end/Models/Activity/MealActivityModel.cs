namespace Fitness_Tracker.Models.Activity
{
    using Fitness_Tracker.Data.Models.Enums;

    /// <summary>
    /// Represents a single meal entry in the per-day activity overview.
    /// </summary>
    public class MealActivityModel
    {
        public int Id { get; set; }

        public string Name { get; set; }

        /// <summary>
        /// Optional weight/amount field (currently not populated in all flows).
        /// </summary>
        public int Weight { get; set; }

        public int Calories { get; set; }

        public double Protein { get; set; }

        public double Carbs { get; set; }

        public double Fat { get; set; }

        public MealOfTheDay MealType { get; set; }

        public TimeSpan Time { get; set; }
    }
}