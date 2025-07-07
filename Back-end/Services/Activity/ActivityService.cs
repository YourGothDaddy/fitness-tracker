namespace Fitness_Tracker.Services.Activity
{
    using Fitness_Tracker.Data;
    using Fitness_Tracker.Models.Activity;
    using Microsoft.EntityFrameworkCore;

    public class ActivityService : IActivityService
    {
        private readonly ApplicationDbContext _databaseContext;

        public ActivityService(ApplicationDbContext databaseContext)
        {
            _databaseContext = databaseContext;
        }

        public async Task<ActivityOverviewModel> GetActivityOverviewAsync(string userId, DateTime date)
        {
            if (string.IsNullOrEmpty(userId))
            {
                throw new ArgumentException("User ID cannot be null or empty", nameof(userId));
            }

            var user = await _databaseContext.Users
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                throw new InvalidOperationException("User not found");
            }

            var startOfDay = date.Date;
            var endOfDay = startOfDay.AddDays(1).AddTicks(-1);

            var meals = await GetMealsForPeriodAsync(userId, startOfDay, endOfDay);
            var exercises = await GetExercisesForPeriodAsync(userId, startOfDay, endOfDay);

            return new ActivityOverviewModel
            {
                Meals = meals,
                Exercises = exercises
            };
        }

        public async Task<ActivityOverviewModel> GetActivityOverviewForPeriodAsync(string userId, DateTime startDate, DateTime endDate)
        {
            if (string.IsNullOrEmpty(userId))
            {
                throw new ArgumentException("User ID cannot be null or empty", nameof(userId));
            }

            var user = await _databaseContext.Users
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                throw new InvalidOperationException("User not found");
            }

            var meals = await GetMealsForPeriodAsync(userId, startDate.Date, endDate.Date.AddDays(1).AddTicks(-1));
            var exercises = await GetExercisesForPeriodAsync(userId, startDate.Date, endDate.Date.AddDays(1).AddTicks(-1));

            return new ActivityOverviewModel
            {
                Meals = meals,
                Exercises = exercises
            };
        }

        private async Task<List<MealActivityModel>> GetMealsForPeriodAsync(string userId, DateTime startDate, DateTime endDate)
        {
            return await _databaseContext.Meals
                .Where(m => m.UserId == userId && m.Date >= startDate && m.Date <= endDate)
                .OrderBy(m => m.Date)
                .Select(m => new MealActivityModel
                {
                    Name = m.Name,
                    Weight = 0, // Add weight property to Meal model if needed
                    Calories = m.Calories,
                    MealType = m.MealOfTheDay,
                    Time = m.Date.TimeOfDay
                })
                .ToListAsync();
        }

        private async Task<List<ExerciseActivityModel>> GetExercisesForPeriodAsync(string userId, DateTime startDate, DateTime endDate)
        {
            return await _databaseContext.Activities
                .Include(a => a.ActivityType)
                .ThenInclude(at => at.ActivityCategory)
                .Where(a => a.UserId == userId && a.Date >= startDate && a.Date <= endDate)
                .OrderBy(a => a.Date)
                .Select(a => new ExerciseActivityModel
                {
                    Name = a.ActivityType.Name,
                    DurationInMinutes = a.DurationInMinutes,
                    CaloriesBurned = a.CaloriesBurned,
                    TimeOfDay = a.TimeOfTheDay,
                    Time = a.Date.TimeOfDay,
                    Category = a.ActivityType.ActivityCategory.Name
                })
                .ToListAsync();
        }

        public async Task<List<ActivityLevelModel>> GetAllActivityLevelsAsync()
        {
            return await _databaseContext.ActivityLevels
                .OrderBy(al => al.Id)
                .Select(al => new ActivityLevelModel
                {
                    Id = al.Id,
                    Name = al.Name,
                    Multiplier = al.Multiplier
                })
                .ToListAsync();
        }

        public async Task AddActivityAsync(Models.Activity.AddActivityModel model, string userId)
        {
            if (model == null)
                throw new ArgumentNullException(nameof(model));
            if (string.IsNullOrEmpty(userId))
                throw new ArgumentException("User ID cannot be null or empty", nameof(userId));

            // Validate ActivityType exists
            var activityType = await _databaseContext.ActivityTypes.FindAsync(model.ActivityTypeId);
            if (activityType == null)
                throw new InvalidOperationException("Invalid ActivityTypeId");

            // Validate User exists
            var user = await _databaseContext.Users.FindAsync(userId);
            if (user == null)
                throw new InvalidOperationException("User not found");

            var activity = new Data.Models.Activity
            {
                DurationInMinutes = model.DurationInMinutes,
                TimeOfTheDay = model.TimeOfTheDay,
                CaloriesBurned = model.CaloriesBurned,
                ActivityTypeId = model.ActivityTypeId,
                Date = model.Date,
                UserId = userId,
                IsPublic = model.IsPublic,
                // Notes is not in the entity, but could be added if needed
            };

            _databaseContext.Activities.Add(activity);
            await _databaseContext.SaveChangesAsync();
        }

        public async Task<List<Models.Activity.ActivityTypeModel>> GetAllActivityTypesAsync()
        {
            return await _databaseContext.ActivityTypes
                .Include(at => at.ActivityCategory)
                .Select(at => new Models.Activity.ActivityTypeModel
                {
                    Id = at.Id,
                    Name = at.Name,
                    Category = at.ActivityCategory.Name
                })
                .ToListAsync();
        }
    }
} 