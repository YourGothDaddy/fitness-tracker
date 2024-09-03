namespace Fitness_Tracker.Data.Models.Consumables
{
    public class Nutrient
    {
        public int Id { get; set; }
        public string Category { get; set; } // e.g., "Carbohydrates", "Vitamins", etc.
        public string Name { get; set; } // e.g., "Fibers", "Vitamin A", etc.
        public double Amount { get; set; } // e.g., 0.5, 1.0, etc.
    }

}
