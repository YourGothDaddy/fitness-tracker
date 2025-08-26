namespace Fitness_Tracker.Controllers
{
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using System.IO;
    using System.Linq;
    using System.Threading.Tasks;
    using Fitness_Tracker.Services.Benchmarking;
    using System;

    [ApiController]
    [Route("api/[controller]")]
    public class BenchmarkController : ControllerBase
    {
        private readonly IBenchmarkService _benchmarkService;

        public BenchmarkController(IBenchmarkService benchmarkService)
        {
            _benchmarkService = benchmarkService;
        }

        [HttpPost("run/{userId}")]
        [Authorize] // protect by auth; adjust as needed
        public async Task<IActionResult> Run(string userId, [FromQuery] int iterations = 3)
        {
            var path = await _benchmarkService.RunBenchmarksAsync(userId, iterations);
            return Ok(new { path });
        }

        [HttpPost("run/me")]
        [Authorize]
        public async Task<IActionResult> RunForCurrentUser([FromQuery] int iterations = 3)
        {
            var userId = User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            var path = await _benchmarkService.RunBenchmarksAsync(userId, iterations);
            return Ok(new { path });
        }

        [HttpGet("reports")]
        [Authorize]
        public IActionResult Reports()
        {
            var folder = Path.Combine(AppContext.BaseDirectory, "benchmark-reports");
            if (!Directory.Exists(folder)) return Ok(Array.Empty<string>());
            var files = Directory.GetFiles(folder, "benchmark_*.json").OrderByDescending(f => f).ToList();
            return Ok(files);
        }

        [HttpPost("client")]
        [Authorize]
        public async Task<IActionResult> SaveClientReport([FromBody] object payload)
        {
            var folder = Path.Combine(AppContext.BaseDirectory, "benchmark-reports", "mobile");
            Directory.CreateDirectory(folder);
            var fileName = $"frontend_benchmark_{DateTime.UtcNow:yyyyMMdd_HHmmss_fff}.json";
            var path = Path.Combine(folder, fileName);
            var json = System.Text.Json.JsonSerializer.Serialize(payload, new System.Text.Json.JsonSerializerOptions { WriteIndented = true });
            await System.IO.File.WriteAllTextAsync(path, json);
            return Ok(new { path });
        }
    }
}

