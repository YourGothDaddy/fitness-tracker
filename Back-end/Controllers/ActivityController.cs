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