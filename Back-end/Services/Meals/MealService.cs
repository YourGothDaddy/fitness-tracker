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
                    UserId = userId
                });

            await _databaseContext.SaveChangesAsync();
        }

        public async Task<List<Meal>> GetAllUserMealsAsync(string userId)
        {
            return await _databaseContext
                 .Meals
                 .Where(u => u.UserId == userId)
                 .ToListAsync();
        }

        public async Task<int> GetTotalUserMealCaloriesAsync(string userId)
        {
            return await _databaseContext
                .Meals
                .Where(u => u.UserId == userId)
                .SumAsync(m => m.Calories);
        }
    }
}
