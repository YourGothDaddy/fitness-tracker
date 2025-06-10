namespace Fitness_Tracker.Models.Nutrition
{
    public class SterolsModel
    {
        public List<SterolNutrientModel> Nutrients { get; set; } = new List<SterolNutrientModel>();
    }

    public class SterolNutrientModel
    {
        public string Label { get; set; }
        public double? Consumed { get; set; }
        public double Required { get; set; }
    }
} 