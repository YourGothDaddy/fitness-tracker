namespace Fitness_Tracker.Services.Activity
{
    using Fitness_Tracker.Data;
    using Fitness_Tracker.Models.Activity;
    using Microsoft.EntityFrameworkCore;
    using Fitness_Tracker.Data.Models.Enums;

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

        public async Task<List<ExerciseMetaDataModel>> GetExerciseMetaDataAsync(string userId)
        {
            // Fetch user weight (default to 70kg if not found)
            var user = await _databaseContext.Users.FirstOrDefaultAsync(u => u.Id == userId);
            float userWeight = user?.Weight ?? 70f;

            // MET values mapping
            var metValues = new Dictionary<(string Category, string Subcategory, string Level), float>
            {
                // Cardio
                { ("Cardio", "Cycling", "Low"), 4.0f },
                { ("Cardio", "Cycling", "Moderate"), 6.8f },
                { ("Cardio", "Cycling", "Hard"), 8.0f },
                { ("Cardio", "Cycling", "Maximal"), 10.0f },
                { ("Cardio", "Jumping Rope", "Low"), 8.8f },
                { ("Cardio", "Jumping Rope", "Moderate"), 11.8f },
                { ("Cardio", "Jumping Rope", "Hard"), 12.3f },
                { ("Cardio", "Running", "Low"), 8.3f }, // 8 km/h
                { ("Cardio", "Running", "Moderate"), 9.8f }, // 9.7 km/h
                { ("Cardio", "Running", "Hard"), 11.0f }, // 11.3 km/h
                { ("Cardio", "Swimming", "Low"), 6.0f },
                { ("Cardio", "Swimming", "Moderate"), 8.0f },
                { ("Cardio", "Swimming", "Hard"), 10.0f },
                { ("Cardio", "Walking", "Low"), 2.0f }, // 3.2 km/h
                { ("Cardio", "Walking", "Moderate"), 3.5f }, // 5.6 km/h
                { ("Cardio", "Walking", "Hard"), 4.3f }, // 6.4 km/h
                // Gym
                { ("Gym", "Resistance Training", "Low"), 3.5f },
                { ("Gym", "Resistance Training", "Moderate"), 5.0f },
                { ("Gym", "Resistance Training", "Hard"), 6.0f },
                { ("Gym", "Circuit Training", "Low"), 7.0f },
                { ("Gym", "Circuit Training", "Moderate"), 8.0f },
                { ("Gym", "Circuit Training", "Hard"), 9.0f },
                // Outdoor Activity
                { ("Outdoor Activity", "Hiking", "Easy trail"), 6.0f },
                { ("Outdoor Activity", "Hiking", "Moderate incline"), 6.5f },
                { ("Outdoor Activity", "Hiking", "Steep or rough terrain"), 7.8f },
                { ("Outdoor Activity", "Cycling", "Low"), 4.0f },
                { ("Outdoor Activity", "Cycling", "Moderate"), 6.8f },
                { ("Outdoor Activity", "Cycling", "Hard"), 8.0f },
                { ("Outdoor Activity", "Cycling", "Maximal"), 10.0f },
            };

            var effortLevelsCycling = new List<string> { "Low", "Moderate", "Hard", "Maximal" };
            var effortLevelsDefault = new List<string> { "Low", "Moderate", "Hard" };
            var terrainTypes = new List<string> { "Easy trail", "Moderate incline", "Steep or rough terrain" };

            var activityTypes = await _databaseContext.ActivityTypes
                .Include(at => at.ActivityCategory)
                .ToListAsync();

            var result = new List<ExerciseMetaDataModel>();
            foreach (var type in activityTypes)
            {
                var meta = new ExerciseMetaDataModel
                {
                    Category = type.ActivityCategory.Name,
                    Subcategory = type.Name
                };
                // Cardio
                if (type.ActivityCategory.Name == "Cardio")
                {
                    if (type.Name == "Cycling")
                    {
                        meta.EffortLevels = effortLevelsCycling;
                        // Default to Moderate for calculation
                        var met = metValues.GetValueOrDefault((meta.Category, meta.Subcategory, "Moderate"), 1f);
                        meta.CaloriesPerMinute = (met * userWeight) / 60f;
                        meta.CaloriesPerHalfHour = (met * userWeight * 30f) / 60f;
                        meta.CaloriesPerHour = (met * userWeight * 60f) / 60f;
                    }
                    else if (new[] { "Jumping Rope", "Running", "Swimming", "Walking" }.Contains(type.Name))
                    {
                        meta.EffortLevels = effortLevelsDefault;
                        // Default to Moderate for calculation
                        var met = metValues.GetValueOrDefault((meta.Category, meta.Subcategory, "Moderate"), 1f);
                        meta.CaloriesPerMinute = (met * userWeight) / 60f;
                        meta.CaloriesPerHalfHour = (met * userWeight * 30f) / 60f;
                        meta.CaloriesPerHour = (met * userWeight * 60f) / 60f;
                    }
                }
                // Gym
                else if (type.ActivityCategory.Name == "Gym")
                {
                    if (new[] { "Resistance Training", "Circuit Training" }.Contains(type.Name))
                    {
                        meta.EffortLevels = effortLevelsDefault;
                        // Default to Moderate for calculation
                        var met = metValues.GetValueOrDefault((meta.Category, meta.Subcategory, "Moderate"), 1f);
                        meta.CaloriesPerMinute = (met * userWeight) / 60f;
                        meta.CaloriesPerHalfHour = (met * userWeight * 30f) / 60f;
                        meta.CaloriesPerHour = (met * userWeight * 60f) / 60f;
                    }
                }
                // Outdoor Activity
                else if (type.ActivityCategory.Name == "Outdoor Activity")
                {
                    if (type.Name == "Cycling")
                    {
                        meta.EffortLevels = effortLevelsCycling;
                        // Default to Moderate for calculation
                        var met = metValues.GetValueOrDefault((meta.Category, meta.Subcategory, "Moderate"), 1f);
                        meta.CaloriesPerMinute = (met * userWeight) / 60f;
                        meta.CaloriesPerHalfHour = (met * userWeight * 30f) / 60f;
                        meta.CaloriesPerHour = (met * userWeight * 60f) / 60f;
                    }
                    else if (type.Name == "Hiking")
                    {
                        meta.TerrainTypes = terrainTypes;
                        // Default to Moderate incline for calculation
                        var met = metValues.GetValueOrDefault((meta.Category, meta.Subcategory, "Moderate incline"), 1f);
                        meta.CaloriesPerMinute = (met * userWeight) / 60f;
                        meta.CaloriesPerHalfHour = (met * userWeight * 30f) / 60f;
                        meta.CaloriesPerHour = (met * userWeight * 60f) / 60f;
                    }
                }
                result.Add(meta);
            }
            return result;
        }
    }
} 