namespace Fitness_Tracker.Services.Weight
{
    using Fitness_Tracker.Models.Weight;

    public interface IWeightService
    {
        Task<WeightProgressModel> GetWeightProgressAsync(string userId, DateTime startDate, DateTime endDate);
        Task<bool> AddWeightRecordAsync(string userId, DateTime date, float weight);
        Task<bool> UpdateWeightRecordAsync(int recordId, string userId, float weight);
        Task<bool> DeleteWeightRecordAsync(int recordId, string userId);
    }
} 