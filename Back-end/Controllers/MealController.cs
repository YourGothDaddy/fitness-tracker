namespace Fitness_Tracker.Controllers
{
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
    }
}
