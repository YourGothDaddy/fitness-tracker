namespace Fitness_Tracker.Models.Activity
{
    public class ActivityOverviewModel
    {
        public List<MealActivityModel> Meals { get; set; } = new List<MealActivityModel>();
        public List<ExerciseActivityModel> Exercises { get; set; } = new List<ExerciseActivityModel>();
    }
} 