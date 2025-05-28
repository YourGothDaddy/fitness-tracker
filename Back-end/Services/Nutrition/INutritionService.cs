namespace Fitness_Tracker.Services.Nutrition
{
    using Fitness_Tracker.Models.Nutrition;
    using System;
    using System.Threading.Tasks;

    public interface INutritionService
    {
        Task<CalorieOverviewModel> GetCalorieOverviewAsync(string userId, DateTime startDate, DateTime endDate);
        Task<DailyCaloriesModel> GetDailyCaloriesAsync(string userId, DateTime date);
        Task<MacronutrientsModel> GetMacronutrientsAsync(string userId, DateTime date);
        Task<EnergyExpenditureModel> GetEnergyExpenditureAsync(string userId, DateTime date);
        Task<EnergyBudgetModel> GetEnergyBudgetAsync(string userId, DateTime date);
    }
} 