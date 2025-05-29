namespace Fitness_Tracker.Models.Nutrition
{
    public class MainTargetsModel
    {
        public List<TargetModel> Targets { get; set; } = new List<TargetModel>();
    }

    public class TargetModel
    {
        public string Label { get; set; }
        public double Consumed { get; set; }
        public double Required { get; set; }
        public string Color { get; set; }
    }
} 