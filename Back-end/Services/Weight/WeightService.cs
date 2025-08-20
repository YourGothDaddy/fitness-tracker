namespace Fitness_Tracker.Services.Weight
{
    using Fitness_Tracker.Data;
    using Fitness_Tracker.Data.Models;
    using Fitness_Tracker.Models.Weight;
    using Microsoft.EntityFrameworkCore;

    public class WeightService : IWeightService
    {
        private readonly ApplicationDbContext _databaseContext;

        public WeightService(ApplicationDbContext databaseContext)
        {
            _databaseContext = databaseContext;
        }

        public async Task<WeightProgressModel> GetWeightProgressAsync(string userId, DateTime startDate, DateTime endDate)
        {
            var user = await _databaseContext.Users
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                throw new InvalidOperationException("User not found");
            }

            var weightRecords = await _databaseContext.WeightRecords
                .Where(wr => wr.UserId == userId && wr.Date.Date >= startDate.Date && wr.Date.Date <= endDate.Date)
                .OrderBy(wr => wr.Date)
                .ToListAsync();

            if (!weightRecords.Any())
            {
                var closestBefore = await _databaseContext.WeightRecords
                    .Where(wr => wr.UserId == userId && wr.Date.Date < startDate.Date)
                    .OrderByDescending(wr => wr.Date)
                    .FirstOrDefaultAsync();

                if (closestBefore != null)
                {
                    weightRecords.Add(closestBefore);
                }
            }

            var dailyWeights = new List<DailyWeightModel>();
            
            var currentDate = startDate.Date;
            while (currentDate <= endDate.Date)
            {
                var recordForDate = weightRecords
                    .Where(wr => wr.Date.Date <= currentDate.Date)
                    .OrderByDescending(wr => wr.Date)
                    .FirstOrDefault();

                float weightForDate = recordForDate != null 
                    ? recordForDate.Weight 
                    : user.Weight;
                
                dailyWeights.Add(new DailyWeightModel
                {
                    Date = currentDate,
                    Weight = weightForDate,
                    DayName = currentDate.ToString("ddd")
                });

                currentDate = currentDate.AddDays(1);
            }

            var allWeightRecords = await _databaseContext.WeightRecords
                .Where(wr => wr.UserId == userId)
                .OrderBy(wr => wr.Date)
                .ToListAsync();

            float startingWeight = allWeightRecords.FirstOrDefault()?.Weight ?? user.Weight;
            float currentWeight = allWeightRecords.LastOrDefault()?.Weight ?? user.Weight;
            float change = currentWeight - startingWeight;

            DateTime? firstRecordDate = allWeightRecords.FirstOrDefault()?.Date;
            var dailyWeightsFromHistory = new List<DailyWeightModel>();
            if (firstRecordDate.HasValue)
            {
                var graphStartDate = startDate.Date < firstRecordDate.Value.Date ? firstRecordDate.Value.Date : startDate.Date;
                var historyCurrentDate = graphStartDate;
                while (historyCurrentDate <= endDate.Date)
                {
                    var recordForDate = allWeightRecords
                        .Where(wr => wr.Date.Date <= historyCurrentDate.Date)
                        .OrderByDescending(wr => wr.Date)
                        .FirstOrDefault();

                    float weightForDate = recordForDate != null 
                        ? recordForDate.Weight 
                        : user.Weight;

                    dailyWeightsFromHistory.Add(new DailyWeightModel
                    {
                        Date = historyCurrentDate,
                        Weight = weightForDate,
                        DayName = historyCurrentDate.ToString("ddd")
                    });

                    historyCurrentDate = historyCurrentDate.AddDays(1);
                }
            }

            float totalWeightToLose = user.Weight - user.GoalWeight;
            float weightLostSoFar = user.Weight - currentWeight;
            float progressPercentage = totalWeightToLose <= 0 
                ? 0 
                : (weightLostSoFar / totalWeightToLose) * 100;

            progressPercentage = Math.Min(Math.Max(progressPercentage, 0), 100);

            return new WeightProgressModel
            {
                StartingWeight = startingWeight,
                CurrentWeight = currentWeight,
                Change = change,
                GoalWeight = user.GoalWeight,
                ProgressPercentage = progressPercentage,
                DailyWeights = dailyWeightsFromHistory
            };
        }

        public async Task<bool> AddWeightRecordAsync(string userId, DateTime date, float weight)
        {
            var user = await _databaseContext.Users.FindAsync(userId);
            if (user == null)
            {
                throw new InvalidOperationException("User not found");
            }

            var existingRecord = await _databaseContext.WeightRecords
                .FirstOrDefaultAsync(wr => wr.UserId == userId && wr.Date.Date == date.Date);

            if (existingRecord != null)
            {
                existingRecord.Weight = weight;
            }
            else
            {
                _databaseContext.WeightRecords.Add(new WeightRecord
                {
                    UserId = userId,
                    Date = date.Date,
                    Weight = weight,
                });
            }

            user.Weight = weight;

            await _databaseContext.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateWeightRecordAsync(int recordId, string userId, float weight)
        {
            var record = await _databaseContext.WeightRecords
                .FirstOrDefaultAsync(wr => wr.Id == recordId && wr.UserId == userId);

            if (record == null)
            {
                return false;
            }

            record.Weight = weight;

            var mostRecentRecord = await _databaseContext.WeightRecords
                .Where(wr => wr.UserId == userId)
                .OrderByDescending(wr => wr.Date)
                .FirstOrDefaultAsync();

            if (mostRecentRecord?.Id == recordId)
            {
                var user = await _databaseContext.Users.FindAsync(userId);
                if (user != null)
                {
                    user.Weight = weight;
                }
            }

            await _databaseContext.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteWeightRecordAsync(int recordId, string userId)
        {
            var record = await _databaseContext.WeightRecords
                .FirstOrDefaultAsync(wr => wr.Id == recordId && wr.UserId == userId);

            if (record == null)
            {
                return false;
            }

            _databaseContext.WeightRecords.Remove(record);

            var nextMostRecentRecord = await _databaseContext.WeightRecords
                .Where(wr => wr.UserId == userId && wr.Id != recordId)
                .OrderByDescending(wr => wr.Date)
                .FirstOrDefaultAsync();

            if (nextMostRecentRecord != null)
            {
                var user = await _databaseContext.Users.FindAsync(userId);
                if (user != null)
                {
                    user.Weight = nextMostRecentRecord.Weight;
                }
            }

            await _databaseContext.SaveChangesAsync();
            return true;
        }
    }
} 