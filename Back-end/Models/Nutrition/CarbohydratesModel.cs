namespace Fitness_Tracker.Models.Nutrition
{
    public class CarbohydratesModel
    {
        public List<CarbohydrateNutrientModel> Nutrients { get; set; } = new List<CarbohydrateNutrientModel>();
    }

    public class CarbohydrateNutrientModel
    {
        public string Label { get; set; }
        public double? Consumed { get; set; }
        public double Required { get; set; }
    }
} 