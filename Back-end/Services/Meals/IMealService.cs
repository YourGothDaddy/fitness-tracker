namespace Fitness_Tracker.Services.Meals
{
    using Fitness_Tracker.Models.Meals;

    public interface IMealService
    {
        public Task CreateMealAsync(string userId, AddMealModel meal);
    }
}
