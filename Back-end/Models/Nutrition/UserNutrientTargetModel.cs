namespace Fitness_Tracker.Models.Nutrition
{
    public class UserNutrientTargetModel
    {
        public int Id { get; set; }
        public string NutrientName { get; set; }
        public string Category { get; set; }
        public bool IsTracked { get; set; }
        public double? DailyTarget { get; set; }
        public bool HasMaxThreshold { get; set; }
        public double? MaxThreshold { get; set; }
    }

    public class UpdateUserNutrientTargetModel
    {
        public string NutrientName { get; set; }
        public string Category { get; set; }
        public bool IsTracked { get; set; }
        public double? DailyTarget { get; set; }
        public bool HasMaxThreshold { get; set; }
        public double? MaxThreshold { get; set; }
    }
} 