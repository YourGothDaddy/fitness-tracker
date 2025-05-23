namespace Fitness_Tracker.Controllers
{
    using Fitness_Tracker.Models.Nutrition;
    using Fitness_Tracker.Services.Nutrition;
    using Microsoft.AspNetCore.Mvc;
    using System.Security.Claims;

    using static Constants.NutritionController;
    using static Constants.General;

    public class NutritionController : BaseApiController
    {
        private readonly INutritionService _nutritionService;

        public NutritionController(INutritionService nutritionService)
        {
            _nutritionService = nutritionService;
        }

        [HttpGet(CalorieOverviewHttpAttributeName)]
        public async Task<IActionResult> GetCalorieOverview([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            var validationResult = ValidateUserAuthentication(out var userId);
            if (validationResult != null)
            {
                return validationResult;
            }

            var result = await _nutritionService.GetCalorieOverviewAsync(userId, startDate, endDate);
            return Ok(result);
        }

        [HttpGet(DailyCaloriesHttpAttributeName)]
        public async Task<IActionResult> GetDailyCalories([FromQuery] DateTime date)
        {
            var validationResult = ValidateUserAuthentication(out var userId);
            if (validationResult != null)
            {
                return validationResult;
            }

            var result = await _nutritionService.GetDailyCaloriesAsync(userId, date);
            return Ok(result);
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