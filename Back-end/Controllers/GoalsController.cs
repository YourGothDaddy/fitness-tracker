using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Fitness_Tracker.Models.Users;
using Fitness_Tracker.Services.Users;
using System.Security.Claims;

namespace Fitness_Tracker.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class GoalsController : ControllerBase
    {
        private readonly IUserService _userService;

        public GoalsController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        public async Task<ActionResult<UpdateGoalsModel>> GetUserGoals()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var goals = await _userService.GetUserGoalsAsync(userId);
                return Ok(goals);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while retrieving user goals.");
            }
        }

        [HttpGet("weight-goal")]
        public async Task<ActionResult<WeightGoalResponseModel>> GetUserWeightGoal()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var weightGoal = await _userService.GetUserWeightGoalAsync(userId);
                return Ok(weightGoal);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while retrieving user weight goal.");
            }
        }

        [HttpPut]
        public async Task<IActionResult> UpdateUserGoals([FromBody] UpdateGoalsModel model)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var result = await _userService.UpdateUserGoalsAsync(userId, model);
                if (result.Succeeded)
                {
                    return Ok();
                }

                return BadRequest(result.Errors);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while updating user goals.");
            }
        }

        [HttpPost("calculate-weight-goal")]
        public async Task<ActionResult<WeightGoalResponseModel>> CalculateWeightGoal([FromBody] WeightGoalModel model)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var result = await _userService.CalculateWeightGoalAsync(userId, model);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while calculating weight goal.");
            }
        }

        [HttpPost("set-weight-goal")]
        public async Task<IActionResult> SetWeightGoal([FromBody] WeightGoalModel model)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var result = await _userService.SetWeightGoalAsync(userId, model);
                if (result.Succeeded)
                {
                    return Ok();
                }

                return BadRequest(result.Errors);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while setting weight goal.");
            }
        }
    }
} 