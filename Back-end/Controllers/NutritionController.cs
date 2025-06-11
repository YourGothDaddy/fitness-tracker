namespace Fitness_Tracker.Controllers
{
    using Fitness_Tracker.Models.Nutrition;
    using Fitness_Tracker.Services.Nutrition;
    using Microsoft.AspNetCore.Mvc;
    using System.Security.Claims;

    using static Constants.NutritionController;
    using static Constants.General;
    using Back_end.Models.Nutrition;

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

        [HttpGet("macronutrients")]
        public async Task<IActionResult> GetMacronutrients([FromQuery] DateTime date)
        {
            var validationResult = ValidateUserAuthentication(out var userId);
            if (validationResult != null)
            {
                return validationResult;
            }

            var result = await _nutritionService.GetMacronutrientsAsync(userId, date);
            return Ok(result);
        }

        [HttpGet("energy-expenditure")]
        public async Task<IActionResult> GetEnergyExpenditure([FromQuery] DateTime date)
        {
            var validationResult = ValidateUserAuthentication(out var userId);
            if (validationResult != null)
            {
                return validationResult;
            }

            try
            {
                var result = await _nutritionService.GetEnergyExpenditureAsync(userId, date);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while retrieving energy expenditure: {ex.Message}");
            }
        }

        [HttpGet("energy-budget")]
        public async Task<IActionResult> GetEnergyBudget([FromQuery] DateTime date)
        {
            var validationResult = ValidateUserAuthentication(out var userId);
            if (validationResult != null)
            {
                return validationResult;
            }

            try
            {
                var result = await _nutritionService.GetEnergyBudgetAsync(userId, date);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while retrieving energy budget: {ex.Message}");
            }
        }

        [HttpGet("main-targets")]
        public async Task<IActionResult> GetMainTargets([FromQuery] DateTime date)
        {
            var validationResult = ValidateUserAuthentication(out var userId);
            if (validationResult != null)
            {
                return validationResult;
            }

            try
            {
                var result = await _nutritionService.GetMainTargetsAsync(userId, date);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while retrieving main targets: {ex.Message}");
            }
        }

        [HttpGet("carbohydrates")]
        public async Task<IActionResult> GetCarbohydrates([FromQuery] DateTime date)
        {
            try
            {
                var validationResult = ValidateUserAuthentication(out var userId);
                if (validationResult != null)
                {
                    return validationResult;
                }

                // Log the received date
                Console.WriteLine($"Received date for carbohydrates: {date}");

                if (date == default(DateTime))
                {
                    return BadRequest("Invalid date parameter");
                }

                var result = await _nutritionService.GetCarbohydratesAsync(userId, date);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                Console.WriteLine($"InvalidOperationException in GetCarbohydrates: {ex.Message}");
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception in GetCarbohydrates: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, $"An error occurred while retrieving carbohydrates data: {ex.Message}");
            }
        }

        [HttpGet("amino-acids")]
        public async Task<IActionResult> GetAminoAcids([FromQuery] DateTime date)
        {
            try
            {
                var validationResult = ValidateUserAuthentication(out var userId);
                if (validationResult != null)
                {
                    return validationResult;
                }

                // Log the received date
                Console.WriteLine($"Received date for amino acids: {date}");

                if (date == default(DateTime))
                {
                    return BadRequest("Invalid date parameter");
                }

                var result = await _nutritionService.GetAminoAcidsAsync(userId, date);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                Console.WriteLine($"InvalidOperationException in GetAminoAcids: {ex.Message}");
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception in GetAminoAcids: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, $"An error occurred while retrieving amino acids data: {ex.Message}");
            }
        }

        [HttpGet("fats")]
        public async Task<ActionResult<FatsModel>> GetFats([FromQuery] DateTime date)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var result = await _nutritionService.GetFatsAsync(userId, date);
                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception in GetAminoAcids: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, "An error occurred while retrieving fats data");
            }
        }

        [HttpGet("minerals")]
        public async Task<IActionResult> GetMinerals([FromQuery] DateTime date)
        {
            try
            {
                var validationResult = ValidateUserAuthentication(out var userId);
                if (validationResult != null)
                {
                    return validationResult;
                }

                // Log the received date
                Console.WriteLine($"Received date for minerals: {date}");

                if (date == default(DateTime))
                {
                    return BadRequest("Invalid date parameter");
                }

                var result = await _nutritionService.GetMineralsAsync(userId, date);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                Console.WriteLine($"InvalidOperationException in GetMinerals: {ex.Message}");
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception in GetMinerals: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, $"An error occurred while retrieving minerals data: {ex.Message}");
            }
        }

        [HttpGet("other")]
        public async Task<ActionResult<OtherNutrientsModel>> GetOtherNutrients([FromQuery] DateTime? date)
        {
            try
            {
                var targetDate = date ?? DateTime.Today;
                var result = await _nutritionService.GetOtherNutrients(targetDate);
                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception in GetOtherNutrients: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, "An error occurred while retrieving other nutrients data");
            }
        }

        [HttpGet("sterols")]
        public async Task<IActionResult> GetSterols([FromQuery] DateTime date)
        {
            try
            {
                var validationResult = ValidateUserAuthentication(out var userId);
                if (validationResult != null)
                {
                    return validationResult;
                }

                // Log the received date
                Console.WriteLine($"Received date for sterols: {date}");

                if (date == default(DateTime))
                {
                    return BadRequest("Invalid date parameter");
                }

                var result = await _nutritionService.GetSterolsAsync(userId, date);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                Console.WriteLine($"InvalidOperationException in GetSterols: {ex.Message}");
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception in GetSterols: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, $"An error occurred while retrieving sterols data: {ex.Message}");
            }
        }

        [HttpGet("vitamins")]
        public async Task<IActionResult> GetVitamins([FromQuery] DateTime date)
        {
            try
            {
                var validationResult = ValidateUserAuthentication(out var userId);
                if (validationResult != null)
                {
                    return validationResult;
                }

                // Log the received date
                Console.WriteLine($"Received date for vitamins: {date}");

                if (date == default(DateTime))
                {
                    return BadRequest("Invalid date parameter");
                }

                var result = await _nutritionService.GetVitaminsAsync(userId, date);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                Console.WriteLine($"InvalidOperationException in GetVitamins: {ex.Message}");
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception in GetVitamins: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, $"An error occurred while retrieving vitamins data: {ex.Message}");
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