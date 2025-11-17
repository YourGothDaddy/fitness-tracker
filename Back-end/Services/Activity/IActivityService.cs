namespace Fitness_Tracker.Services.Activity
{
    using Fitness_Tracker.Models.Activity;

    public interface IActivityService
    {
        Task<ActivityOverviewModel> GetActivityOverviewAsync(string userId, DateTime date);
        Task<ActivityOverviewModel> GetActivityOverviewForPeriodAsync(string userId, DateTime startDate, DateTime endDate);
        Task<List<ActivityLevelModel>> GetAllActivityLevelsAsync();
        Task AddActivityAsync(Models.Activity.AddActivityModel model, string userId);
        Task<List<Models.Activity.ActivityTypeModel>> GetAllActivityTypesAsync();
        Task<List<Models.Activity.ExerciseMetaDataModel>> GetExerciseMetaDataAsync(string userId);
        Task<CalculateExerciseCaloriesResponse> CalculateExerciseCaloriesAsync(string userId, CalculateExerciseCaloriesRequest request);
        Task<int?> GetActivityTypeIdByCategoryAndSubcategoryAsync(string category, string subcategory);
        Task AddFavoriteActivityTypeAsync(string userId, int activityTypeId);
        Task RemoveFavoriteActivityTypeAsync(string userId, int activityTypeId);
        Task<bool> IsFavoriteActivityTypeAsync(string userId, int activityTypeId);
        Task<List<Models.Activity.ActivityTypeModel>> GetFavoriteActivityTypesAsync(string userId);
        Task<int> CreateCustomActivityTypeAsync(Models.Admins.AddActivityTypeModel model, string userId);
        Task<List<Models.Activity.ActivityTypeModel>> GetPublicActivityTypesAsync();
        // Custom activity types removed
        // Custom workout methods removed

        Task<bool> DeleteActivityAsync(int id, string userId);

        Task<bool> UpdateActivityAsync(int id, string userId, UpdateActivityModel model);

        // Hierarchical listings
        Task<List<string>> GetActivityCategoriesAsync();
        Task<List<string>> GetSubcategoriesByCategoryAsync(string category);
        Task<List<Models.Activity.ActivityExerciseVariantModel>> GetExercisesByCategoryAndSubcategoryAsync(string category, string subcategory);
    }
} 