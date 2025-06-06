namespace Fitness_Tracker.Models.Nutrition
{
    public class MineralsModel
    {
        public List<MineralNutrientModel> Nutrients { get; set; } = new List<MineralNutrientModel>();
    }

    public class MineralNutrientModel
    {
        public string Label { get; set; }
        public double? Consumed { get; set; }
        public double Required { get; set; }
    }
} 