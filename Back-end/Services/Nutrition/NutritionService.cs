namespace Fitness_Tracker.Services.Nutrition
{
    using Fitness_Tracker.Data;
    using Fitness_Tracker.Models.Nutrition;
    using Microsoft.EntityFrameworkCore;

    public class NutritionService : INutritionService
    {
        private readonly ApplicationDbContext _databaseContext;

        public NutritionService(ApplicationDbContext databaseContext)
        {
            _databaseContext = databaseContext;
        }

        public async Task<CalorieOverviewModel> GetCalorieOverviewAsync(string userId, DateTime startDate, DateTime endDate)
        {
            var user = await _databaseContext.Users
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                throw new InvalidOperationException("User not found");
            }

            var dailyCalories = await _databaseContext.Meals
                .Where(m => m.UserId == userId && m.Date >= startDate.Date && m.Date <= endDate.Date)
                .GroupBy(m => m.Date.Date)
                .Select(g => new DailyCaloriesModel
                {
                    Date = g.Key,
                    TotalCalories = g.Sum(m => m.Calories)
                })
                .ToListAsync();

            var averageCalories = dailyCalories.Any() 
                ? (int)Math.Round(dailyCalories.Average(d => d.TotalCalories)) 
                : 0;

            var deficit = user.DailyCaloriesGoal - averageCalories;

            return new CalorieOverviewModel
            {
                DailyAverage = averageCalories,
                Target = user.DailyCaloriesGoal,
                Deficit = deficit,
                DailyCalories = dailyCalories
            };
        }

        public async Task<DailyCaloriesModel> GetDailyCaloriesAsync(string userId, DateTime date)
        {
            var totalCalories = await _databaseContext.Meals
                .Where(m => m.UserId == userId && m.Date.Date == date.Date)
                .SumAsync(m => m.Calories);

            return new DailyCaloriesModel
            {
                Date = date.Date,
                TotalCalories = totalCalories
            };
        }
    }
} 