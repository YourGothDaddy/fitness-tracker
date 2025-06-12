namespace Fitness_Tracker.Services.Meals
{
    using Fitness_Tracker.Data;
    using Fitness_Tracker.Data.Models;
    using Fitness_Tracker.Models.Meals;
    using Microsoft.EntityFrameworkCore;
    using System.Collections.Generic;
    using System.Threading.Tasks;

    public class MealService : IMealService
    {

        private readonly ApplicationDbContext _databaseContext;

        public MealService(ApplicationDbContext databaseContext)
        {
            this._databaseContext = databaseContext;
        }

        public async Task CreateMealAsync(string userId, AddMealModel meal)
        {
            await _databaseContext
                .Meals
                .AddAsync(new Meal
                {
                    Name = meal.Name,
                    MealOfTheDay = meal.MealOfTheDay,
                    Calories = meal.Calories,
                    Protein = meal.Protein,
                    Carbs = meal.Carbs,
                    Fat = meal.Fat,
                    UserId = userId,
                    Date = (meal.Date != DateTime.MinValue) ? meal.Date : DateTime.UtcNow.Date
                });

            await _databaseContext.SaveChangesAsync();
        }

        public async Task<List<Meal>> GetAllUserMealsAsync(string userId, DateTime date)
        {

            return await _databaseContext
                 .Meals
                 .Where(m => m.UserId == userId && m.Date.Year == date.Date.Year
                 && m.Date.Month == date.Date.Month
                 && m.Date.Day == date.Date.Day)
                 .ToListAsync();
        }

        public async Task<int> GetTotalUserMealCaloriesAsync(string userId, DateTime date)
        {
            return await _databaseContext
                .Meals
                .Where(m => m.UserId == userId && m.Date == date.Date)
                .SumAsync(m => m.Calories);
        }

        public async Task<List<MealListModel>> GetAllMealsAsync()
        {
            return await _databaseContext
                .Meals
                .Select(m => new MealListModel
                {
                    Id = m.Id,
                    Name = m.Name,
                    Calories = m.Calories,
                    Protein = m.Protein,
                    Carbs = m.Carbs,
                    Fat = m.Fat
                })
                .Distinct()
                .ToListAsync();
        }
    }
}
