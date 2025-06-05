namespace Fitness_Tracker.Models.Nutrition
{
    public class FatsModel
    {
        public List<FatNutrientModel> Nutrients { get; set; } = new List<FatNutrientModel>();
    }

    public class FatNutrientModel
    {
        public string Label { get; set; }
        public double? Consumed { get; set; }
        public double Required { get; set; }
    }
} 