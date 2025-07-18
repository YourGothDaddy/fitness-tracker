namespace Fitness_Tracker.Services.Nutrition
{
    using Back_end.Models.Nutrition;
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
        Task<MainTargetsModel> GetMainTargetsAsync(string userId, DateTime date);
        Task<CarbohydratesModel> GetCarbohydratesAsync(string userId, DateTime date);
        Task<AminoAcidsModel> GetAminoAcidsAsync(string userId, DateTime date);
        Task<FatsModel> GetFatsAsync(string userId, DateTime date);
        Task<MineralsModel> GetMineralsAsync(string userId, DateTime date);
        Task<OtherNutrientsModel> GetOtherNutrients(DateTime date);
        Task<SterolsModel> GetSterolsAsync(string userId, DateTime date);
        Task<VitaminsModel> GetVitaminsAsync(string userId, DateTime date);
        Task<EnergySettingsModel> GetEnergySettingsAsync(string userId, double? customBmr, int? activityLevelId, bool includeTef);
        Task<List<UserNutrientTargetModel>> GetUserNutrientTargetsAsync(string userId);
        Task<UserNutrientTargetModel> UpdateUserNutrientTargetAsync(string userId, UpdateUserNutrientTargetModel model);
    }
} 