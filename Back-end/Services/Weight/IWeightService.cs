namespace Fitness_Tracker.Services.Weight
{
    using Fitness_Tracker.Models.Weight;

    public interface IWeightService
    {
        Task<WeightProgressModel> GetWeightProgressAsync(string userId, DateTime startDate, DateTime endDate);
        Task<bool> AddWeightRecordAsync(string userId, DateTime date, float weight, string notes);
        Task<bool> UpdateWeightRecordAsync(int recordId, string userId, float weight, string notes);
        Task<bool> DeleteWeightRecordAsync(int recordId, string userId);
    }
} 