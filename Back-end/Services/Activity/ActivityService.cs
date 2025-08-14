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
                    Id = m.Id,
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
                    Id = a.Id,
                    Name = a.ActivityType.Name,
                    DurationInMinutes = a.DurationInMinutes,
                    CaloriesBurned = a.CaloriesBurned,
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
            var user = await _databaseContext.Users.FirstOrDefaultAsync(u => u.Id == userId);
            float userWeight = user?.Weight ?? 70f;

            var activityTypes = await _databaseContext.ActivityTypes
                .Include(at => at.ActivityCategory)
                .Where(at => at.IsPublic)
                .Where(at => _databaseContext.ActivityExercises.Any(e => e.ActivityTypeId == at.Id && e.IsPublic))
                .ToListAsync();

            var result = new List<ExerciseMetaDataModel>();
            
            foreach (var type in activityTypes)
            {
                var firstExercise = await _databaseContext.ActivityExercises
                    .Include(e => e.MetProfiles)
                    .FirstOrDefaultAsync(e => e.ActivityTypeId == type.Id && e.IsPublic);

                if (firstExercise == null || !firstExercise.MetProfiles.Any())
                    continue;

                var meta = new ExerciseMetaDataModel
                {
                    Category = type.ActivityCategory.Name,
                    Subcategory = type.Name
                };

                var availableKeys = firstExercise.MetProfiles.Select(mp => mp.Key).OrderBy(k => k).ToList();
                
                bool isHiking = type.Name == "Hiking" && type.ActivityCategory.Name == "Outdoor Activity";
                
                if (isHiking)
                {
                    meta.TerrainTypes = availableKeys;
                }
                else
                {
                    meta.EffortLevels = availableKeys;
                }

                var defaultKey = GetDefaultEffortKey(availableKeys, isHiking);
                var defaultProfile = firstExercise.MetProfiles.FirstOrDefault(mp => mp.Key == defaultKey)
                                  ?? firstExercise.MetProfiles.First();

                var met = defaultProfile.Met;
                meta.CaloriesPerMinute = (met * userWeight) / 60f;
                meta.CaloriesPerHalfHour = (met * userWeight * 30f) / 60f;
                meta.CaloriesPerHour = (met * userWeight * 60f) / 60f;

                result.Add(meta);
            }
            
            return result;
        }

        private static string GetDefaultEffortKey(List<string> availableKeys, bool isHiking)
        {
            if (isHiking)
            {
                return availableKeys.FirstOrDefault(k => k.Contains("Moderate")) ?? availableKeys.First();
            }
            else
            {
                return availableKeys.FirstOrDefault(k => k == "Moderate") ?? availableKeys.First();
            }
        }

        /// <summary>
        /// Gets MET value from database for given category, subcategory, exercise and effort level/terrain type
        /// </summary>
        private async Task<float> GetMetValueFromDatabaseAsync(string category, string subcategory, string exercise, string effortLevelOrTerrain)
        {
            if (!string.IsNullOrWhiteSpace(exercise))
            {
                var specificExercise = await _databaseContext.ActivityExercises
                    .Include(e => e.ActivityType)
                    .ThenInclude(t => t.ActivityCategory)
                    .Include(e => e.MetProfiles)
                    .FirstOrDefaultAsync(e => e.Name == exercise 
                                           && e.ActivityType.Name == subcategory 
                                           && e.ActivityType.ActivityCategory.Name == category
                                           && e.IsPublic);

                if (specificExercise?.MetProfiles.Any() == true)
                {
                    var exactProfile = specificExercise.MetProfiles.FirstOrDefault(p => p.Key == effortLevelOrTerrain);
                    if (exactProfile != null)
                        return exactProfile.Met;
                    
                    var fallbackProfile = specificExercise.MetProfiles.FirstOrDefault(p => p.Key.Contains("Moderate"))
                                        ?? specificExercise.MetProfiles.First();
                    return fallbackProfile.Met;
                }
            }

            var anyExercise = await _databaseContext.ActivityExercises
                .Include(e => e.ActivityType)
                .ThenInclude(t => t.ActivityCategory)
                .Include(e => e.MetProfiles)
                .FirstOrDefaultAsync(e => e.ActivityType.Name == subcategory 
                                       && e.ActivityType.ActivityCategory.Name == category
                                       && e.IsPublic
                                       && e.MetProfiles.Any(p => p.Key == effortLevelOrTerrain));

            if (anyExercise != null)
            {
                var profile = anyExercise.MetProfiles.FirstOrDefault(p => p.Key == effortLevelOrTerrain);
                if (profile != null)
                    return profile.Met;
            }

            var moderateExercise = await _databaseContext.ActivityExercises
                .Include(e => e.ActivityType)
                .ThenInclude(t => t.ActivityCategory)
                .Include(e => e.MetProfiles)
                .FirstOrDefaultAsync(e => e.ActivityType.Name == subcategory 
                                       && e.ActivityType.ActivityCategory.Name == category
                                       && e.IsPublic
                                       && e.MetProfiles.Any());

            if (moderateExercise?.MetProfiles.Any() == true)
            {
                var moderateProfile = moderateExercise.MetProfiles.FirstOrDefault(p => p.Key.Contains("Moderate"))
                                    ?? moderateExercise.MetProfiles.First();
                return moderateProfile.Met;
            }

            return 5.0f;
        }

        public async Task<CalculateExerciseCaloriesResponse> CalculateExerciseCaloriesAsync(string userId, CalculateExerciseCaloriesRequest request)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));
            if (string.IsNullOrWhiteSpace(request.Category) || string.IsNullOrWhiteSpace(request.Subcategory))
                throw new ArgumentException("Category and Subcategory are required.");
            if (request.DurationInMinutes <= 0)
                throw new ArgumentException("Duration must be greater than 0.");

            try
            {
                var user = await _databaseContext.Users.FirstOrDefaultAsync(u => u.Id == userId);
                float userWeight = user?.Weight ?? 70f;

                string category = request.Category;
                string subcategory = request.Subcategory;
                string effortLevel = request.EffortLevel;
                string terrainType = request.TerrainType;
                string exercise = request.Exercise;
                int duration = request.DurationInMinutes;

                bool isHiking = category == "Outdoor Activity" && subcategory == "Hiking";
                string effectiveKey;
                
                if (isHiking)
                {
                    effectiveKey = !string.IsNullOrWhiteSpace(terrainType) ? terrainType : "Moderate incline";
                }
                else
                {
                    effectiveKey = !string.IsNullOrWhiteSpace(effortLevel) ? effortLevel : "Moderate";
                }

                float met = await GetMetValueFromDatabaseAsync(category, subcategory, exercise, effectiveKey);

                float caloriesPerMinute = (met * userWeight) / 60f;
                float caloriesPerHalfHour = (met * userWeight * 30f) / 60f;
                float caloriesPerHour = (met * userWeight * 60f) / 60f;
                float totalCalories = caloriesPerMinute * duration;

                return new CalculateExerciseCaloriesResponse
                {
                    CaloriesPerMinute = caloriesPerMinute,
                    CaloriesPerHalfHour = caloriesPerHalfHour,
                    CaloriesPerHour = caloriesPerHour,
                    TotalCalories = totalCalories
                };
            }
            catch (Exception ex) when (!(ex is ArgumentException || ex is ArgumentNullException))
            {
                throw new InvalidOperationException($"Failed to calculate exercise calories: {ex.Message}", ex);
            }
        }

        /// <summary>
        /// Gets the ActivityTypeId for a given category and subcategory.
        /// </summary>
        public async Task<int?> GetActivityTypeIdByCategoryAndSubcategoryAsync(string category, string subcategory)
        {
            var activityType = await _databaseContext.ActivityTypes
                .Include(at => at.ActivityCategory)
                .FirstOrDefaultAsync(at => at.Name == subcategory && at.ActivityCategory.Name == category);
                
            return activityType?.Id;
        }

        public async Task AddFavoriteActivityTypeAsync(string userId, int activityTypeId)
        {
            if (string.IsNullOrEmpty(userId))
                throw new ArgumentException("User ID cannot be null or empty", nameof(userId));
            var exists = await _databaseContext.UserFavoriteActivityTypes.AnyAsync(x => x.UserId == userId && x.ActivityTypeId == activityTypeId);
            if (!exists)
            {
                _databaseContext.UserFavoriteActivityTypes.Add(new Data.Models.UserFavoriteActivityType
                {
                    UserId = userId,
                    ActivityTypeId = activityTypeId
                });
                await _databaseContext.SaveChangesAsync();
            }
        }

        public async Task RemoveFavoriteActivityTypeAsync(string userId, int activityTypeId)
        {
            var entity = await _databaseContext.UserFavoriteActivityTypes.FirstOrDefaultAsync(x => x.UserId == userId && x.ActivityTypeId == activityTypeId);
            if (entity != null)
            {
                _databaseContext.UserFavoriteActivityTypes.Remove(entity);
                await _databaseContext.SaveChangesAsync();
            }
        }

        public async Task<bool> IsFavoriteActivityTypeAsync(string userId, int activityTypeId)
        {
            return await _databaseContext.UserFavoriteActivityTypes.AnyAsync(x => x.UserId == userId && x.ActivityTypeId == activityTypeId);
        }

        public async Task<List<Models.Activity.ActivityTypeModel>> GetFavoriteActivityTypesAsync(string userId)
        {
            var result = await _databaseContext.UserFavoriteActivityTypes
                .Where(x => x.UserId == userId)
                .Select(x => new Models.Activity.ActivityTypeModel
                {
                    Id = x.ActivityType.Id,
                    Name = x.ActivityType.Name,
                    Category = x.ActivityType.ActivityCategory.Name,
                    IsPublic = x.ActivityType.IsPublic,
                    CreatedByUserId = x.ActivityType.CreatedByUserId,
                    Calories = x.ActivityType.Calories
                })
                .ToListAsync();
            return result;
        }

        public async Task<int> CreateCustomActivityTypeAsync(Models.Admins.AddActivityTypeModel model, string userId)
        {
            if (model == null) throw new ArgumentNullException(nameof(model));
            if (string.IsNullOrEmpty(userId)) throw new ArgumentException("User ID cannot be null or empty", nameof(userId));

            var activityCategory = await _databaseContext.ActivityCategories.FindAsync(model.ActivityCategoryId);
            if (activityCategory == null) throw new InvalidOperationException("Invalid ActivityCategoryId");

            var newActivityType = new Data.Models.ActivityType
            {
                Name = model.Name,
                ActivityCategoryId = activityCategory.Id,
                IsPublic = false,
                CreatedByUserId = userId,
                Calories = model.Calories // Set the calories for custom workouts
            };
            _databaseContext.ActivityTypes.Add(newActivityType);
            await _databaseContext.SaveChangesAsync();
            return newActivityType.Id;
        }

        public async Task<List<Models.Activity.ActivityTypeModel>> GetPublicActivityTypesAsync()
        {
            return await _databaseContext.ActivityTypes
                .Include(at => at.ActivityCategory)
                .Where(at => at.IsPublic)
                .Select(at => new Models.Activity.ActivityTypeModel
                {
                    Id = at.Id,
                    Name = at.Name,
                    Category = at.ActivityCategory.Name,
                    IsPublic = at.IsPublic,
                    CreatedByUserId = at.CreatedByUserId,
                    Calories = at.Calories
                })
                .ToListAsync();
        }

        public async Task<List<Models.Activity.ActivityTypeModel>> GetUserCustomActivityTypesAsync(string userId)
        {
            var result = await _databaseContext.ActivityTypes
                .Include(at => at.ActivityCategory)
                .Where(at => at.CreatedByUserId == userId && !at.IsPublic)
                .Select(at => new Models.Activity.ActivityTypeModel
                {
                    Id = at.Id,
                    Name = at.Name,
                    Category = at.ActivityCategory.Name,
                    IsPublic = at.IsPublic,
                    CreatedByUserId = at.CreatedByUserId,
                    Calories = at.Calories
                })
                .ToListAsync();
            return result;
        }

        public async Task<int> CreateCustomWorkoutAsync(string userId, Models.Activity.CustomWorkoutModel model)
        {
            if (model == null) throw new ArgumentNullException(nameof(model));
            if (string.IsNullOrEmpty(userId)) throw new ArgumentException("User ID cannot be null or empty", nameof(userId));

            var customWorkout = new Data.Models.CustomWorkout
            {
                UserId = userId,
                Name = model.Name,
                ActivityCategoryId = model.ActivityCategoryId,
                ActivityTypeId = model.ActivityTypeId,
                DurationInMinutes = model.DurationInMinutes,
                CaloriesBurned = model.CaloriesBurned,
                Notes = model.Notes
            };
            _databaseContext.CustomWorkouts.Add(customWorkout);
            await _databaseContext.SaveChangesAsync();
            return customWorkout.Id;
        }

        public async Task<List<Models.Activity.CustomWorkoutModel>> GetUserCustomWorkoutsAsync(string userId)
        {
            return await _databaseContext.CustomWorkouts
                .Include(cw => cw.ActivityCategory)
                .Where(cw => cw.UserId == userId)
                .Select(cw => new Models.Activity.CustomWorkoutModel
                {
                    Id = cw.Id,
                    Name = cw.Name,
                    ActivityCategoryId = cw.ActivityCategoryId,
                    ActivityCategoryName = cw.ActivityCategory.Name,
                    ActivityTypeId = cw.ActivityTypeId,
                    DurationInMinutes = cw.DurationInMinutes,
                    CaloriesBurned = cw.CaloriesBurned,
                    Notes = cw.Notes
                })
                .ToListAsync();
        }

        public async Task<bool> DeleteActivityAsync(int id, string userId)
        {
            var activity = await _databaseContext.Activities.FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);
            if (activity == null)
            {
                return false;
            }
            _databaseContext.Activities.Remove(activity);
            await _databaseContext.SaveChangesAsync();
            return true;
        }

        public async Task<List<string>> GetActivityCategoriesAsync()
        {
            return await _databaseContext.ActivityCategories
                .OrderBy(c => c.Name)
                .Select(c => c.Name)
                .ToListAsync();
        }

        public async Task<List<string>> GetSubcategoriesByCategoryAsync(string category)
        {
            return await _databaseContext.ActivityTypes
                .Include(t => t.ActivityCategory)
                .Where(t => t.ActivityCategory.Name == category && t.IsPublic)
                .Where(t => t.ActivityExercises.Any(e => e.IsPublic))
                .OrderBy(t => t.Name)
                .Select(t => t.Name)
                .Distinct()
                .ToListAsync();
        }

        public async Task<List<ActivityExerciseVariantModel>> GetExercisesByCategoryAndSubcategoryAsync(string category, string subcategory)
        {
            var query = _databaseContext.ActivityExercises
                .Include(e => e.ActivityType)
                .ThenInclude(t => t.ActivityCategory)
                .Include(e => e.MetProfiles)
                .Where(e => e.IsPublic && e.ActivityType.Name == subcategory && e.ActivityType.ActivityCategory.Name == category);

            var list = await query
                .OrderBy(e => e.Name)
                .Select(e => new ActivityExerciseVariantModel
                {
                    Id = e.Id,
                    Name = e.Name,
                    Keys = e.MetProfiles.Select(mp => mp.Key).OrderBy(k => k).ToList()
                })
                .ToListAsync();
            return list;
        }
    }
} 