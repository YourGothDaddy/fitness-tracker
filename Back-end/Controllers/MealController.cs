namespace Fitness_Tracker.Controllers
{
    using Fitness_Tracker.Models.Meals;
    using Fitness_Tracker.Services.Meals;
    using Microsoft.AspNetCore.Mvc;
    using System.Security.Claims;

    using static Constants.MealController;
    using static Constants.General;

    public class MealController : BaseApiController
    {
        private readonly IMealService _mealService;

        public MealController(IMealService mealService)
        {
            _mealService = mealService;
        }

        [HttpPost(AddMealHttpAttributeName)]
        public async Task<IActionResult> AddMeal([FromBody] AddMealModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { Message = InvalidModelStateError });
            }

            var validationResult = ValidateUserAuthentication(out var userId);
            if (validationResult != null)
            {
                return validationResult;
            }

            await _mealService.CreateMealAsync(userId, model);

            return Ok(new { Message = MealAddedSuccessfully });
        }

        [HttpGet(AllMealsHttpAttributeName)]
        public async Task<IActionResult> AllMeals([FromQuery] DateTime date)
        {
            var validationResult = ValidateUserAuthentication(out var userId);
            if (validationResult != null)
            {
                return validationResult;
            }

            var result = await _mealService.GetAllUserMealsAsync(userId, date);

            return Ok(result);
        }

        [HttpGet(AllMealsCaloriesHttpAttributeName)]
        public async Task<IActionResult> AllMealsCalories([FromQuery] DateTime date)
        {
            var validationResult = ValidateUserAuthentication(out var userId);
            if (validationResult != null)
            {
                return validationResult;
            }

            var totalCalories = await _mealService.GetTotalUserMealCaloriesAsync(userId, date);

            return Ok(totalCalories);
        }

        [HttpGet(GetAllMealsHttpAttributeName)]
        public async Task<IActionResult> GetAllMeals()
        {
            var validationResult = ValidateUserAuthentication(out var userId);
            if (validationResult != null)
            {
                return validationResult;
            }

            var meals = await _mealService.GetAllMealsAsync();
            return Ok(meals);
        }

        [HttpDelete(DeleteMealHttpAttributeName)]
        public async Task<IActionResult> DeleteMeal(int id)
        {
            var validationResult = ValidateUserAuthentication(out var userId);
            if (validationResult != null)
            {
                return validationResult;
            }

            var deleted = await _mealService.DeleteMealAsync(id, userId);
            if (!deleted)
            {
                return NotFound(new { Message = "Meal not found." });
            }

            return Ok(new { Message = "Meal deleted successfully." });
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
