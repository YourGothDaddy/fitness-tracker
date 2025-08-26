namespace Fitness_Tracker.Services.Meals
{
    using Fitness_Tracker.Data;
    using Fitness_Tracker.Data.Models;
    using Fitness_Tracker.Models.Meals;
    using Microsoft.EntityFrameworkCore;
    using System.Collections.Generic;
    using System.Threading.Tasks;
    using Microsoft.EntityFrameworkCore.Infrastructure;

    public class MealService : IMealService
    {

        private readonly ApplicationDbContext _databaseContext;

        private static readonly Func<ApplicationDbContext, string, DateTime, DateTime, IQueryable<Meal>> MealsByUserAndRangeQuery =
            EF.CompileQuery((ApplicationDbContext ctx, string userId, DateTime start, DateTime end) =>
                ctx.Meals
                   .AsNoTracking()
                   .Where(m => m.UserId == userId && m.Date >= start && m.Date < end)
                   .OrderBy(m => m.Date));

        private static readonly Func<ApplicationDbContext, string, DateTime, DateTime, int> SumCaloriesByUserAndRangeQuery =
            EF.CompileQuery((ApplicationDbContext ctx, string userId, DateTime start, DateTime end) =>
                ctx.Meals
                   .Where(m => m.UserId == userId && m.Date >= start && m.Date < end)
                   .Sum(m => m.Calories));

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
                    Date = meal.Date
                });

            await _databaseContext.SaveChangesAsync();
        }

        public async Task<List<Meal>> GetAllUserMealsAsync(string userId, DateTime date)
        {
            var start = date.Date;
            var end = start.AddDays(1);
            return await _databaseContext
                 .Meals
                 .AsNoTracking()
                 .Where(m => m.UserId == userId && m.Date >= start && m.Date < end)
                 .OrderBy(m => m.Date)
                 .ToListAsync();
        }

        public async Task<int> GetTotalUserMealCaloriesAsync(string userId, DateTime date)
        {
            var start = date.Date;
            var end = start.AddDays(1);
            var total = SumCaloriesByUserAndRangeQuery(_databaseContext, userId, start, end);
            return await Task.FromResult(total);
        }

        public async Task<List<MealListModel>> GetAllMealsAsync()
        {
            return await _databaseContext
                .Meals
                .AsNoTracking()
                .Select(m => new MealListModel
                {
                    Id = m.Id,
                    Name = m.Name,
                    Calories = m.Calories,
                    Protein = m.Protein,
                    Carbs = m.Carbs,
                    Fat = m.Fat
                })
                .ToListAsync();
        }

        public async Task<bool> DeleteMealAsync(int id, string userId)
        {
            var meal = await _databaseContext.Meals.FirstOrDefaultAsync(m => m.Id == id && m.UserId == userId);
            if (meal == null)
            {
                return false;
            }
            _databaseContext.Meals.Remove(meal);
            await _databaseContext.SaveChangesAsync();
            return true;
        }
    }
}
