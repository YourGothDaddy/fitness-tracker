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

            // Get all weight records in the date range
            var weightRecords = await _databaseContext.WeightRecords
                .Where(wr => wr.UserId == userId && wr.Date.Date >= startDate.Date && wr.Date.Date <= endDate.Date)
                .OrderBy(wr => wr.Date)
                .ToListAsync();

            // If no records in the range, try to get closest records before and after
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

            // Create daily weight models
            var dailyWeights = new List<DailyWeightModel>();
            
            // If we have weight records, create data points for each day in the range
            var currentDate = startDate.Date;
            while (currentDate <= endDate.Date)
            {
                // Find weight record for this date or the closest previous record
                var recordForDate = weightRecords
                    .Where(wr => wr.Date.Date <= currentDate.Date)
                    .OrderByDescending(wr => wr.Date)
                    .FirstOrDefault();

                // If no previous record, use the user's current weight
                float weightForDate = recordForDate != null 
                    ? recordForDate.Weight 
                    : user.Weight;
                
                dailyWeights.Add(new DailyWeightModel
                {
                    Date = currentDate,
                    Weight = weightForDate,
                    DayName = currentDate.ToString("ddd") // Short day name (Mon, Tue, etc.)
                });

                currentDate = currentDate.AddDays(1);
            }

            // Determine starting and current weight
            float startingWeight = dailyWeights.FirstOrDefault()?.Weight ?? user.Weight;
            float currentWeight = dailyWeights.LastOrDefault()?.Weight ?? user.Weight;
            float change = currentWeight - startingWeight;

            // Calculate progress percentage towards goal
            float totalWeightToLose = user.Weight - user.GoalWeight;
            float weightLostSoFar = user.Weight - currentWeight;
            float progressPercentage = totalWeightToLose <= 0 
                ? 0 
                : (weightLostSoFar / totalWeightToLose) * 100;

            // Cap progress at 100%
            progressPercentage = Math.Min(Math.Max(progressPercentage, 0), 100);

            return new WeightProgressModel
            {
                StartingWeight = startingWeight,
                CurrentWeight = currentWeight,
                Change = change,
                GoalWeight = user.GoalWeight,
                ProgressPercentage = progressPercentage,
                DailyWeights = dailyWeights
            };
        }

        public async Task<bool> AddWeightRecordAsync(string userId, DateTime date, float weight, string notes)
        {
            var user = await _databaseContext.Users.FindAsync(userId);
            if (user == null)
            {
                throw new InvalidOperationException("User not found");
            }

            // Check if a record already exists for this date
            var existingRecord = await _databaseContext.WeightRecords
                .FirstOrDefaultAsync(wr => wr.UserId == userId && wr.Date.Date == date.Date);

            if (existingRecord != null)
            {
                // Update existing record
                existingRecord.Weight = weight;
                existingRecord.Notes = notes;
            }
            else
            {
                // Create new record
                _databaseContext.WeightRecords.Add(new WeightRecord
                {
                    UserId = userId,
                    Date = date.Date,
                    Weight = weight,
                    Notes = notes
                });
            }

            // Update the current weight in the user profile
            user.Weight = weight;

            await _databaseContext.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateWeightRecordAsync(int recordId, string userId, float weight, string notes)
        {
            var record = await _databaseContext.WeightRecords
                .FirstOrDefaultAsync(wr => wr.Id == recordId && wr.UserId == userId);

            if (record == null)
            {
                return false;
            }

            record.Weight = weight;
            record.Notes = notes;

            // Check if this is the most recent record
            var mostRecentRecord = await _databaseContext.WeightRecords
                .Where(wr => wr.UserId == userId)
                .OrderByDescending(wr => wr.Date)
                .FirstOrDefaultAsync();

            if (mostRecentRecord?.Id == recordId)
            {
                // Update user's current weight if this is the most recent record
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

            // If deleting the most recent record, update user weight to the next most recent record
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