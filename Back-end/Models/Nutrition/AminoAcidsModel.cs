namespace Fitness_Tracker.Models.Nutrition
{
    public class AminoAcidsModel
    {
        public List<AminoAcidNutrientModel> Nutrients { get; set; } = new List<AminoAcidNutrientModel>();
    }

    public class AminoAcidNutrientModel
    {
        public string Label { get; set; }
        public double? Consumed { get; set; }
        public double Required { get; set; }
    }
} 