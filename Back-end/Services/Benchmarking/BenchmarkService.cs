namespace Fitness_Tracker.Services.Benchmarking
{
    using System;
    using System.Collections.Generic;
    using System.Diagnostics;
    using System.IO;
    using System.Linq;
    using System.Text.Json;
    using System.Threading.Tasks;
    using Fitness_Tracker.Services.Activity;
    using Fitness_Tracker.Services.Meals;
    using Fitness_Tracker.Services.Nutrition;

    public class BenchmarkService : IBenchmarkService
    {
        private readonly IActivityService _activityService;
        private readonly IMealService _mealService;
        private readonly INutritionService _nutritionService;

        public BenchmarkService(
            IActivityService activityService,
            IMealService mealService,
            INutritionService nutritionService)
        {
            _activityService = activityService;
            _mealService = mealService;
            _nutritionService = nutritionService;
        }

        public async Task<string> RunBenchmarksAsync(string userId, int iterations = 3)
        {
            if (string.IsNullOrWhiteSpace(userId)) throw new ArgumentException("userId is required", nameof(userId));
            if (iterations <= 0) iterations = 1;

            var today = DateTime.UtcNow.Date;
            var start = today.AddDays(-7);
            var end = today;

            var results = new Dictionary<string, List<double>>()
            {
                { "GetActivityOverviewAsync", new List<double>() },
                { "GetActivityOverviewForPeriodAsync", new List<double>() },
                { "GetAllUserMealsAsync", new List<double>() },
                { "GetTotalUserMealCaloriesAsync", new List<double>() },
                { "GetCalorieOverviewAsync", new List<double>() },
                { "GetMacronutrientsAsync", new List<double>() },
                { "GetEnergyExpenditureAsync", new List<double>() },
                { "GetEnergyBudgetAsync", new List<double>() }
            };

            async Task Measure(string name, Func<Task> action)
            {
                var sw = new Stopwatch();
                sw.Start();
                await action();
                sw.Stop();
                results[name].Add(sw.Elapsed.TotalMilliseconds);
            }

            for (int i = 0; i < iterations; i++)
            {
                await Measure("GetActivityOverviewAsync", () => _activityService.GetActivityOverviewAsync(userId, today));
                await Measure("GetActivityOverviewForPeriodAsync", () => _activityService.GetActivityOverviewForPeriodAsync(userId, start, end));
                await Measure("GetAllUserMealsAsync", () => _mealService.GetAllUserMealsAsync(userId, today));
                await Measure("GetTotalUserMealCaloriesAsync", () => _mealService.GetTotalUserMealCaloriesAsync(userId, today));
                await Measure("GetCalorieOverviewAsync", () => _nutritionService.GetCalorieOverviewAsync(userId, start, end));
                await Measure("GetMacronutrientsAsync", () => _nutritionService.GetMacronutrientsAsync(userId, today));
                await Measure("GetEnergyExpenditureAsync", () => _nutritionService.GetEnergyExpenditureAsync(userId, today));
                await Measure("GetEnergyBudgetAsync", () => _nutritionService.GetEnergyBudgetAsync(userId, today));
            }

            var summary = results.ToDictionary(
                kvp => kvp.Key,
                kvp => new
                {
                    iterations = kvp.Value.Count,
                    avg_ms = Math.Round(kvp.Value.Average(), 3),
                    p95_ms = Math.Round(Percentile(kvp.Value, 95), 3),
                    min_ms = Math.Round(kvp.Value.Min(), 3),
                    max_ms = Math.Round(kvp.Value.Max(), 3)
                });

            var report = new
            {
                userId,
                timestampUtc = DateTime.UtcNow,
                iterations,
                metrics = summary
            };

            var folder = Path.Combine(AppContext.BaseDirectory, "benchmark-reports");
            Directory.CreateDirectory(folder);
            var fileName = $"benchmark_{DateTime.UtcNow:yyyyMMdd_HHmmss_fff}.json";
            var fullPath = Path.Combine(folder, fileName);

            var json = JsonSerializer.Serialize(report, new JsonSerializerOptions
            {
                WriteIndented = true
            });
            await File.WriteAllTextAsync(fullPath, json);
            return fullPath;
        }

        private static double Percentile(List<double> sequence, double percentile)
        {
            if (sequence == null || sequence.Count == 0) return 0;
            var sorted = sequence.OrderBy(x => x).ToList();
            var position = (percentile / 100.0) * (sorted.Count + 1);
            var index = (int)Math.Floor(position) - 1;
            index = Math.Clamp(index, 0, sorted.Count - 1);
            return sorted[index];
        }
    }
}

