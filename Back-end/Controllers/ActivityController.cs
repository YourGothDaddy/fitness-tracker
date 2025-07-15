namespace Fitness_Tracker.Controllers
{
    using Fitness_Tracker.Services.Activity;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using System.Security.Claims;

    using static Constants.ActivityController;
    using static Constants.General;

    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ActivityController : BaseApiController
    {
        private readonly IActivityService _activityService;

        public ActivityController(IActivityService activityService)
        {
            _activityService = activityService;
        }

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
                Console.WriteLine($"[ActivityController] userId: {userId}, received date: {date:O}");
                var result = await _activityService.GetActivityOverviewAsync(userId, date);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while retrieving activity overview: {ex.Message}");
            }
        }

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
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while retrieving activity overview: {ex.Message}");
            }
        }

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

        [HttpGet("types")]
        public async Task<IActionResult> GetActivityTypes()
        {
            var types = await _activityService.GetAllActivityTypesAsync();
            return Ok(types);
        }

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