namespace Fitness_Tracker.Services.Meals
{
    using Fitness_Tracker.Data.Models;
    using Fitness_Tracker.Models.Meals;

    public interface IMealService
    {
        public Task CreateMealAsync(string userId, AddMealModel meal);

        public Task<List<Meal>> GetAllUserMealsAsync(string userId, DateTime date);

        public Task<int> GetTotalUserMealCaloriesAsync(string userId, DateTime date);
    }
}
