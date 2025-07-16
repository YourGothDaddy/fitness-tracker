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
        Task<ExerciseMetaDataModel> CalculateExerciseCaloriesAsync(string userId, CalculateExerciseCaloriesRequest request);
        Task<int?> GetActivityTypeIdByCategoryAndSubcategoryAsync(string category, string subcategory);
        Task AddFavoriteActivityTypeAsync(string userId, int activityTypeId);
        Task RemoveFavoriteActivityTypeAsync(string userId, int activityTypeId);
        Task<bool> IsFavoriteActivityTypeAsync(string userId, int activityTypeId);
        Task<List<Models.Activity.ActivityTypeModel>> GetFavoriteActivityTypesAsync(string userId);
    }
} 