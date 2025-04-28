namespace Fitness_Tracker.Services.Nutrition
{
    using Fitness_Tracker.Models.Nutrition;

    public interface INutritionService
    {
        Task<CalorieOverviewModel> GetCalorieOverviewAsync(string userId, DateTime startDate, DateTime endDate);
        Task<DailyCaloriesModel> GetDailyCaloriesAsync(string userId, DateTime date);
    }
} 