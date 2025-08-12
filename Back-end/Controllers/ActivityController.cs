namespace Fitness_Tracker.Controllers
{
    using Fitness_Tracker.Services.Activity;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using System.Security.Claims;

    using static Constants.ActivityController;
    using static Constants.General;

    /// <summary>
    /// Controller responsible for managing user activities, including tracking, retrieving, and managing activity types and favorites.
    /// </summary>
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ActivityController : BaseApiController
    {
        private readonly IActivityService _activityService;

        /// <summary>
        /// Initializes a new instance of the <see cref="ActivityController"/> class.
        /// </summary>
        /// <param name="activityService">The activity service used for activity-related operations.</param>
        public ActivityController(IActivityService activityService)
        {
            _activityService = activityService;
        }

        /// <summary>
        /// Retrieves an overview of the user's activity for a specific date.
        /// </summary>
        /// <param name="date">The date for which to retrieve the activity overview.</param>
        /// <returns>An <see cref="IActionResult"/> containing the activity overview or an error response.</returns>
        /// <exception cref="InvalidOperationException">Thrown when the operation is invalid for the current state.</exception>
        /// <exception cref="Exception">Thrown when an unexpected error occurs.</exception>
        /// <remarks>
        /// Returns 401 if the user is not authenticated. Returns 400 for invalid operations. Returns 500 for server errors.
        /// </remarks>
        [HttpGet(ActivityOverviewHttpAttributeName)]
        public async Task<IActionResult> GetActivityOverview([FromQuery] DateTime date)
        {
            var validationResult = ValidateUserAuthentication(out var userId);
            if (validationResult != null)
            {
                return validationResult;
            }

            try
            {
                var result = await _activityService.GetActivityOverviewAsync(userId, date);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                if (ex.Message?.Contains("User not found", StringComparison.OrdinalIgnoreCase) == true)
                {
                    return Unauthorized(new { Message = ex.Message });
                }
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while retrieving activity overview: {ex.Message}");
            }
        }

        /// <summary>
        /// Retrieves an overview of the user's activity for a specified date range.
        /// </summary>
        /// <param name="startDate">The start date of the period.</param>
        /// <param name="endDate">The end date of the period.</param>
        /// <returns>An <see cref="IActionResult"/> containing the activity overview for the period or an error response.</returns>
        /// <exception cref="InvalidOperationException">Thrown when the operation is invalid for the current state.</exception>
        /// <exception cref="Exception">Thrown when an unexpected error occurs.</exception>
        /// <remarks>
        /// Returns 401 if the user is not authenticated. Returns 400 for invalid operations. Returns 500 for server errors.
        /// </remarks>
        [HttpGet(ActivityOverviewForPeriodHttpAttributeName)]
        public async Task<IActionResult> GetActivityOverviewForPeriod([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            var validationResult = ValidateUserAuthentication(out var userId);
            if (validationResult != null)
            {
                return validationResult;
            }

            try
            {
                var result = await _activityService.GetActivityOverviewForPeriodAsync(userId, startDate, endDate);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                if (ex.Message?.Contains("User not found", StringComparison.OrdinalIgnoreCase) == true)
                {
                    return Unauthorized(new { Message = ex.Message });
                }
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while retrieving activity overview: {ex.Message}");
            }
        }

        /// <summary>
        /// Retrieves all available activity levels.
        /// </summary>
        /// <returns>An <see cref="IActionResult"/> containing a list of activity levels or an error response.</returns>
        /// <exception cref="Exception">Thrown when an unexpected error occurs.</exception>
        /// <remarks>
        /// Returns 401 if the user is not authenticated. Returns 500 for server errors.
        /// </remarks>
        [HttpGet("activity-levels")]
        public async Task<IActionResult> GetActivityLevels()
        {
            var validationResult = ValidateUserAuthentication(out var userId);
            if (validationResult != null)
            {
                return validationResult;
            }

            try
            {
                var result = await _activityService.GetAllActivityLevelsAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while retrieving activity levels: {ex.Message}");
            }
        }

        /// <summary>
        /// Adds a new activity for the authenticated user.
        /// </summary>
        /// <param name="model">The model containing activity details to add.</param>
        /// <returns>An <see cref="IActionResult"/> indicating the result of the operation.</returns>
        /// <exception cref="ArgumentNullException">Thrown when required parameters are null.</exception>
        /// <exception cref="InvalidOperationException">Thrown when the operation is invalid for the current state.</exception>
        /// <exception cref="Exception">Thrown when an unexpected error occurs.</exception>
        /// <remarks>
        /// Returns 401 if the user is not authenticated. Returns 400 for invalid or null input. Returns 500 for server errors.
        /// </remarks>
        [HttpPost("add")]
        public async Task<IActionResult> AddActivity([FromBody] Models.Activity.AddActivityModel model)
        {
            var validationResult = ValidateUserAuthentication(out var userId);
            if (validationResult != null)
            {
                return validationResult;
            }

            try
            {
                await _activityService.AddActivityAsync(model, userId);
                return Ok(new { Message = "Activity added successfully." });
            }
            catch (ArgumentNullException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while adding activity: {ex.Message}");
            }
        }

        /// <summary>
        /// Retrieves all available activity types.
        /// </summary>
        /// <returns>An <see cref="IActionResult"/> containing a list of activity types.</returns>
        [HttpGet("types")]
        public async Task<IActionResult> GetActivityTypes()
        {
            var types = await _activityService.GetAllActivityTypesAsync();
            return Ok(types);
        }

        /// <summary>
        /// Retrieves exercise metadata, such as categories and subcategories. Allows anonymous access.
        /// </summary>
        /// <returns>An <see cref="IActionResult"/> containing exercise metadata or an error response.</returns>
        /// <exception cref="Exception">Thrown when an unexpected error occurs.</exception>
        /// <remarks>
        /// If the user is authenticated, user-specific metadata may be returned. Returns 500 for server errors.
        /// </remarks>
        [AllowAnonymous]
        [HttpGet("exercise-metadata")]
        public async Task<IActionResult> GetExerciseMetaData()
        {
            string userId = null;
            if (User.Identity != null && User.Identity.IsAuthenticated)
            {
                userId = GetUserId();
            }
            try
            {
                var result = await _activityService.GetExerciseMetaDataAsync(userId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while retrieving exercise metadata: {ex.Message}");
            }
        }

        /// <summary>
        /// Calculates the calories burned for a specific exercise based on user input.
        /// </summary>
        /// <param name="request">The request containing exercise details for calorie calculation.</param>
        /// <returns>An <see cref="IActionResult"/> containing the calculated calories or an error response.</returns>
        /// <exception cref="ArgumentNullException">Thrown when required parameters are null.</exception>
        /// <exception cref="InvalidOperationException">Thrown when the operation is invalid for the current state.</exception>
        /// <exception cref="Exception">Thrown when an unexpected error occurs.</exception>
        /// <remarks>
        /// Returns 401 if the user is not authenticated. Returns 400 for invalid or null input. Returns 500 for server errors.
        /// </remarks>
        [HttpPost("calculate-exercise-calories")]
        public async Task<IActionResult> CalculateExerciseCalories([FromBody] Models.Activity.CalculateExerciseCaloriesRequest request)
        {
            var validationResult = ValidateUserAuthentication(out var userId);
            if (validationResult != null)
            {
                return validationResult;
            }

            try
            {
                var result = await _activityService.CalculateExerciseCaloriesAsync(userId, request);
                return Ok(result);
            }
            catch (ArgumentNullException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while calculating exercise calories: {ex.Message}");
            }
        }

        /// <summary>
        /// Tracks an exercise for the authenticated user, including calorie calculation and activity addition.
        /// </summary>
        /// <param name="model">The model containing exercise tracking details.</param>
        /// <returns>An <see cref="IActionResult"/> indicating the result of the operation.</returns>
        /// <exception cref="ArgumentNullException">Thrown when required parameters are null.</exception>
        /// <exception cref="InvalidOperationException">Thrown when the operation is invalid for the current state.</exception>
        /// <exception cref="Exception">Thrown when an unexpected error occurs.</exception>
        /// <remarks>
        /// Returns 401 if the user is not authenticated. Returns 400 for invalid or null input, or if the category/subcategory is invalid. Returns 500 for server errors.
        /// </remarks>
        [HttpPost("track-exercise")]
        public async Task<IActionResult> TrackExercise([FromBody] Models.Activity.TrackExerciseRequest model)
        {
            var validationResult = ValidateUserAuthentication(out var userId);
            if (validationResult != null)
            {
                return validationResult;
            }

            try
            {
                var activityTypeId = await _activityService.GetActivityTypeIdByCategoryAndSubcategoryAsync(model.Category, model.Subcategory);
                if (activityTypeId == null)
                {
                    return BadRequest("Invalid category or subcategory");
                }

                var caloriesResult = await _activityService.CalculateExerciseCaloriesAsync(userId, new Models.Activity.CalculateExerciseCaloriesRequest
                {
                    Category = model.Category,
                    Subcategory = model.Subcategory,
                    EffortLevel = model.EffortLevel,
                    DurationInMinutes = model.DurationInMinutes,
                    TerrainType = model.TerrainType
                });

                var addModel = new Models.Activity.AddActivityModel
                {
                    DurationInMinutes = model.DurationInMinutes,
                    CaloriesBurned = (int)Math.Round(caloriesResult.CaloriesPerMinute * model.DurationInMinutes),
                    ActivityTypeId = activityTypeId.Value,
                    Date = model.Date,
                    Notes = model.Notes,
                    IsPublic = model.IsPublic ?? true
                };
                await _activityService.AddActivityAsync(addModel, userId);
                return Ok(new { Message = "Exercise tracked successfully." });
            }
            catch (ArgumentNullException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while tracking exercise: {ex.Message}");
            }
        }

        /// <summary>
        /// Adds an activity type to the user's list of favorite activities.
        /// </summary>
        /// <param name="activityTypeId">The ID of the activity type to add to favorites.</param>
        /// <returns>An <see cref="IActionResult"/> indicating the result of the operation.</returns>
        [HttpPost("favorites/add")]
        public async Task<IActionResult> AddFavoriteActivityType([FromBody] int activityTypeId)
        {
            var validationResult = ValidateUserAuthentication(out var userId);
            if (validationResult != null)
            {
                return validationResult;
            }
            await _activityService.AddFavoriteActivityTypeAsync(userId, activityTypeId);
            return Ok(new { Message = "Added to favorites." });
        }

        /// <summary>
        /// Removes an activity type from the user's list of favorite activities.
        /// </summary>
        /// <param name="activityTypeId">The ID of the activity type to remove from favorites.</param>
        /// <returns>An <see cref="IActionResult"/> indicating the result of the operation.</returns>
        [HttpPost("favorites/remove")]
        public async Task<IActionResult> RemoveFavoriteActivityType([FromBody] int activityTypeId)
        {
            var validationResult = ValidateUserAuthentication(out var userId);
            if (validationResult != null)
            {
                return validationResult;
            }
            await _activityService.RemoveFavoriteActivityTypeAsync(userId, activityTypeId);
            return Ok(new { Message = "Removed from favorites." });
        }

        /// <summary>
        /// Retrieves the user's favorite activity types.
        /// </summary>
        /// <returns>An <see cref="IActionResult"/> containing a list of favorite activity types.</returns>
        [HttpGet("favorites")]
        public async Task<IActionResult> GetFavoriteActivityTypes()
        {
            var validationResult = ValidateUserAuthentication(out var userId);
            if (validationResult != null)
            {
                return validationResult;
            }
            var favorites = await _activityService.GetFavoriteActivityTypesAsync(userId);
            return Ok(favorites);
        }

        /// <summary>
        /// Determines whether a specific activity type is marked as a favorite by the user.
        /// </summary>
        /// <param name="activityTypeId">The ID of the activity type to check.</param>
        /// <returns>An <see cref="IActionResult"/> containing a boolean indicating if the activity type is a favorite.</returns>
        [HttpGet("favorites/{activityTypeId}/is-favorite")]
        public async Task<IActionResult> IsFavoriteActivityType(int activityTypeId)
        {
            var validationResult = ValidateUserAuthentication(out var userId);
            if (validationResult != null)
            {
                return validationResult;
            }
            var isFavorite = await _activityService.IsFavoriteActivityTypeAsync(userId, activityTypeId);
            return Ok(new { IsFavorite = isFavorite });
        }

        /// <summary>
        /// Creates a custom activity type for the authenticated user (not public).
        /// </summary>
        /// <remarks>
        /// This endpoint is reserved for admin or global activity types. Users should use /custom-workout for personal custom workouts.
        /// </remarks>
        [HttpPost("custom-activity-type")]
        public async Task<IActionResult> CreateCustomActivityType([FromBody] Models.Admins.AddActivityTypeModel model)
        {
            // Prevent regular users from using this endpoint for personal custom workouts
            var validationResult = ValidateUserAuthentication(out var userId);
            if (validationResult != null)
            {
                return validationResult;
            }
            // Optionally, check for admin role here if needed
            // For now, always return BadRequest for non-admins
            return BadRequest("This endpoint is reserved for admin or global activity types. Use /custom-workout for personal custom workouts.");
        }

        /// <summary>
        /// Retrieves all public activity types (for 'All' section).
        /// </summary>
        [HttpGet("public-activity-types")]
        public async Task<IActionResult> GetPublicActivityTypes()
        {
            var types = await _activityService.GetPublicActivityTypesAsync();
            return Ok(types);
        }

        /// <summary>
        /// Retrieves all custom activity types created by the current user (for 'Custom' section).
        /// </summary>
        [HttpGet("custom-activity-types")]
        public async Task<IActionResult> GetUserCustomActivityTypes()
        {
            var validationResult = ValidateUserAuthentication(out var userId);
            if (validationResult != null)
            {
                return validationResult;
            }
            var types = await _activityService.GetUserCustomActivityTypesAsync(userId);
            return Ok(types);
        }

        /// <summary>
        /// Creates a new custom workout for the current user.
        /// </summary>
        [HttpPost("custom-workout")]
        public async Task<IActionResult> CreateCustomWorkout([FromBody] Models.Activity.CustomWorkoutModel model)
        {
            var validationResult = ValidateUserAuthentication(out var userId);
            if (validationResult != null)
            {
                return validationResult;
            }
            try
            {
                var id = await _activityService.CreateCustomWorkoutAsync(userId, model);
                return Ok(new { Id = id, Message = "Custom workout created." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while creating custom workout: {ex.Message}");
            }
        }

        /// <summary>
        /// Retrieves all custom workouts created by the current user.
        /// </summary>
        [HttpGet("custom-workouts")]
        public async Task<IActionResult> GetUserCustomWorkouts()
        {
            var validationResult = ValidateUserAuthentication(out var userId);
            if (validationResult != null)
            {
                return validationResult;
            }
            try
            {
                var workouts = await _activityService.GetUserCustomWorkoutsAsync(userId);
                return Ok(workouts);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while retrieving custom workouts: {ex.Message}");
            }
        }

        // PRIVATE METHODS

        private string GetUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }

        private IActionResult ValidateUserAuthentication(out string userId)
        {
            userId = GetUserId();

            if (userId == null)
            {
                return Unauthorized(new { Message = UserIsNotAuthenticatedError });
            }

            return null;
        }
    }
} 