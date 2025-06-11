namespace Fitness_Tracker.Models.Nutrition
{
    public class VitaminsModel
    {
        public List<VitaminNutrientModel> Nutrients { get; set; } = new List<VitaminNutrientModel>();
    }

    public class VitaminNutrientModel
    {
        public string Label { get; set; }
        public double? Consumed { get; set; }
        public double Required { get; set; }
    }
} 