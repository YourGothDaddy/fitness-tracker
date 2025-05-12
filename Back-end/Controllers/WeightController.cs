namespace Fitness_Tracker.Controllers
{
    using Fitness_Tracker.Services.Weight;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using System;
    using System.Security.Claims;
    using System.Threading.Tasks;

    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class WeightController : BaseApiController
    {
        private readonly IWeightService _weightService;

        public WeightController(IWeightService weightService)
        {
            _weightService = weightService;
        }

        [HttpGet("weight-progress")]
        public async Task<IActionResult> GetWeightProgress([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                // If no dates are provided, default to last 7 days
                var actualStartDate = startDate ?? DateTime.UtcNow.AddDays(-6);
                var actualEndDate = endDate ?? DateTime.UtcNow;
                
                var weightProgress = await _weightService.GetWeightProgressAsync(userId, actualStartDate, actualEndDate);
                return Ok(weightProgress);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while retrieving weight progress: {ex.Message}");
            }
        }

        [HttpPost("record")]
        public async Task<IActionResult> AddWeightRecord([FromBody] AddWeightRecordRequest request)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var result = await _weightService.AddWeightRecordAsync(userId, request.Date, request.Weight, request.Notes);
                return result ? Ok() : BadRequest("Failed to add weight record");
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while adding weight record: {ex.Message}");
            }
        }

        [HttpPut("record/{id}")]
        public async Task<IActionResult> UpdateWeightRecord(int id, [FromBody] UpdateWeightRecordRequest request)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var result = await _weightService.UpdateWeightRecordAsync(id, userId, request.Weight, request.Notes);
                return result ? Ok() : NotFound("Weight record not found");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while updating weight record: {ex.Message}");
            }
        }

        [HttpDelete("record/{id}")]
        public async Task<IActionResult> DeleteWeightRecord(int id)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var result = await _weightService.DeleteWeightRecordAsync(id, userId);
                return result ? Ok() : NotFound("Weight record not found");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while deleting weight record: {ex.Message}");
            }
        }

        public class AddWeightRecordRequest
        {
            public DateTime Date { get; set; }
            public float Weight { get; set; }
            public string Notes { get; set; }
        }

        public class UpdateWeightRecordRequest
        {
            public float Weight { get; set; }
            public string Notes { get; set; }
        }
    }
} 