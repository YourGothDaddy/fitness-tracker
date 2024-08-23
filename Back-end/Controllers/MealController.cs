namespace Fitness_Tracker.Controllers
{
    using Fitness_Tracker.Data.Models;
    using Fitness_Tracker.Models.Meals;
    using Fitness_Tracker.Services.Meals;
    using Microsoft.AspNetCore.Mvc;
    using System.Security.Claims;

    public class MealController : BaseApiController
    {
        private readonly IMealService _mealService;

        public MealController(IMealService mealService)
        {
            this._mealService = mealService;
        }

        [HttpPost("add")]
        public async Task<IActionResult> AddMeal([FromBody] AddMealModel model)
        {
            if(!ModelState.IsValid)
            {
                return BadRequest();
            }

            string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if(userId == null) { 
                return BadRequest();
            }

            await _mealService.CreateMealAsync(userId, model);

            return Ok();
        }

        [HttpGet("all")]
        public async Task<IActionResult> AllMeals([FromQuery] DateTime date)
        {
            string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if(userId == null)
            {
                return BadRequest();
            }

            List<Meal> result = await _mealService.GetAllUserMealsAsync(userId, date);

            return Ok(result);
        }

        [HttpGet("calories")]
        public async Task<IActionResult> AllMealsCalories([FromQuery] DateTime date)
        {
            string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userId == null)
            {
                return BadRequest();
            }

            int result = await _mealService.GetTotalUserMealCaloriesAsync(userId, date);

            return Ok(result);
        }
    }
}
