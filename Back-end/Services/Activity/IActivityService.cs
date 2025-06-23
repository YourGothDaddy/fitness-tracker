namespace Fitness_Tracker.Services.Activity
{
    using Fitness_Tracker.Models.Activity;

    public interface IActivityService
    {
        Task<ActivityOverviewModel> GetActivityOverviewAsync(string userId, DateTime date);
        Task<ActivityOverviewModel> GetActivityOverviewForPeriodAsync(string userId, DateTime startDate, DateTime endDate);
        Task<List<ActivityLevelModel>> GetAllActivityLevelsAsync();
    }
} 