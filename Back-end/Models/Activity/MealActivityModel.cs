namespace Fitness_Tracker.Models.Activity
{
    using Fitness_Tracker.Data.Models.Enums;

    public class MealActivityModel
    {
        public string Name { get; set; }
        public int Weight { get; set; }
        public int Calories { get; set; }
        public MealOfTheDay MealType { get; set; }
        public TimeSpan Time { get; set; }
    }
} 