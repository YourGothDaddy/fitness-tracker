namespace Fitness_Tracker.Models.Weight
{
    public class WeightProgressModel
    {
        public float StartingWeight { get; set; }
        public float CurrentWeight { get; set; }
        public float Change { get; set; }
        public float GoalWeight { get; set; }
        public float ProgressPercentage { get; set; }
        public List<DailyWeightModel> DailyWeights { get; set; } = new List<DailyWeightModel>();
    }
} 