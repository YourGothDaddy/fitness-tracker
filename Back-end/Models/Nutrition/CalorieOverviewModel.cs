namespace Fitness_Tracker.Models.Nutrition
{
    public class CalorieOverviewModel
    {
        public int DailyAverage { get; set; }
        public int Target { get; set; }
        public int Deficit { get; set; }
        public List<DailyCaloriesModel> DailyCalories { get; set; } = new List<DailyCaloriesModel>();
    }
} 