namespace Fitness_Tracker.Services.Nutrition
{
    using Fitness_Tracker.Data;
    using Fitness_Tracker.Data.Models;
    using Fitness_Tracker.Models.Nutrition;
    using Microsoft.EntityFrameworkCore;
    using System;
    using System.Linq;
    using System.Threading.Tasks;

    public class NutritionService : INutritionService
    {
        private readonly ApplicationDbContext _databaseContext;

        public NutritionService(ApplicationDbContext databaseContext)
        {
            _databaseContext = databaseContext;
        }

        public async Task<CalorieOverviewModel> GetCalorieOverviewAsync(string userId, DateTime startDate, DateTime endDate)
        {
            var user = await _databaseContext.Users
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                throw new InvalidOperationException("User not found");
            }

            var dailyCalories = await _databaseContext.Meals
                .Where(m => m.UserId == userId && m.Date >= startDate.Date && m.Date <= endDate.Date)
                .GroupBy(m => m.Date.Date)
                .Select(g => new DailyCaloriesModel
                {
                    Date = g.Key,
                    TotalCalories = g.Sum(m => m.Calories)
                })
                .ToListAsync();

            var averageCalories = dailyCalories.Any() 
                ? (int)Math.Round(dailyCalories.Average(d => d.TotalCalories)) 
                : 0;

            var deficit = user.DailyCaloriesGoal - averageCalories;

            return new CalorieOverviewModel
            {
                DailyAverage = averageCalories,
                Target = user.DailyCaloriesGoal,
                Deficit = deficit,
                DailyCalories = dailyCalories
            };
        }

        public async Task<DailyCaloriesModel> GetDailyCaloriesAsync(string userId, DateTime date)
        {
            var totalCalories = await _databaseContext.Meals
                .Where(m => m.UserId == userId && m.Date.Date == date.Date)
                .SumAsync(m => m.Calories);

            return new DailyCaloriesModel
            {
                Date = date.Date,
                TotalCalories = totalCalories
            };
        }

        public async Task<MacronutrientsModel> GetMacronutrientsAsync(string userId, DateTime date)
        {
            var meals = await _databaseContext.Meals
                .Where(m => m.UserId == userId && m.Date.Date == date.Date)
                .ToListAsync();

            var totalProtein = meals.Sum(m => m.Protein);
            var totalCarbs = meals.Sum(m => m.Carbs);
            var totalFat = meals.Sum(m => m.Fat);
            var totalMacros = totalProtein + totalCarbs + totalFat;

            return new MacronutrientsModel
            {
                Protein = totalProtein,
                Carbs = totalCarbs,
                Fat = totalFat,
                TotalMacros = totalMacros,
                ProteinPercentage = totalMacros > 0 ? (totalProtein / totalMacros) * 100 : 0,
                CarbsPercentage = totalMacros > 0 ? (totalCarbs / totalMacros) * 100 : 0,
                FatPercentage = totalMacros > 0 ? (totalFat / totalMacros) * 100 : 0
            };
        }

        public async Task<EnergyExpenditureModel> GetEnergyExpenditureAsync(string userId, DateTime date)
        {
            var user = await _databaseContext.Users
                .Include(u => u.ActivityLevel)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                throw new InvalidOperationException("User not found");
            }

            // Calculate BMR using Mifflin-St Jeor Equation
            double bmr;
            if (user.Gender == Data.Models.Enums.Gender.Male)
            {
                bmr = (10 * user.Weight) + (6.25 * user.Height) - (5 * user.Age) + 5;
            }
            else
            {
                bmr = (10 * user.Weight) + (6.25 * user.Height) - (5 * user.Age) - 161;
            }

            // Get exercise calories for the day
            var exerciseCalories = await _databaseContext.Activities
                .Where(a => a.UserId == userId && a.Date.Date == date.Date)
                .SumAsync(a => a.CaloriesBurned);

            // Calculate baseline activity calories (based on activity level multiplier)
            var baselineActivityCalories = bmr * (user.ActivityLevel.Multiplier - 1);

            // Get meals for TEF calculation
            var meals = await _databaseContext.Meals
                .Where(m => m.UserId == userId && m.Date.Date == date.Date)
                .ToListAsync();

            // Calculate TEF (Thermic Effect of Food)
            double tefCalories = 0;
            foreach (var meal in meals)
            {
                // Protein: 25% of calories
                var proteinCalories = meal.Protein * 4; // 4 calories per gram of protein
                tefCalories += proteinCalories * 0.25;

                // Carbs: 8% of calories
                var carbCalories = meal.Carbs * 4; // 4 calories per gram of carbs
                tefCalories += carbCalories * 0.08;

                // Fat: 2% of calories
                var fatCalories = meal.Fat * 9; // 9 calories per gram of fat
                tefCalories += fatCalories * 0.02;
            }

            var totalEnergyBurned = bmr + exerciseCalories + baselineActivityCalories + tefCalories;

            return new EnergyExpenditureModel
            {
                BMR = Math.Round(bmr, 1),
                ExerciseCalories = Math.Round((double)exerciseCalories, 1),
                BaselineActivityCalories = Math.Round(baselineActivityCalories, 1),
                TEFCalories = Math.Round(tefCalories, 1),
                TotalEnergyBurned = Math.Round(totalEnergyBurned, 1),
                BMRPercentage = Math.Round((bmr / totalEnergyBurned) * 100, 1),
                ExercisePercentage = Math.Round((exerciseCalories / totalEnergyBurned) * 100, 1),
                BaselineActivityPercentage = Math.Round((baselineActivityCalories / totalEnergyBurned) * 100, 1),
                TEFPercentage = Math.Round((tefCalories / totalEnergyBurned) * 100, 1)
            };
        }

        public async Task<EnergyBudgetModel> GetEnergyBudgetAsync(string userId, DateTime date)
        {
            var user = await _databaseContext.Users
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                throw new InvalidOperationException("User not found");
            }

            var consumedCalories = await _databaseContext.Meals
                .Where(m => m.UserId == userId && m.Date.Date == date.Date)
                .SumAsync(m => m.Calories);

            var target = user.DailyCaloriesGoal;
            var remaining = target - consumedCalories;

            return new EnergyBudgetModel
            {
                Target = target,
                Consumed = consumedCalories,
                Remaining = remaining
            };
        }

        public async Task<MainTargetsModel> GetMainTargetsAsync(string userId, DateTime date)
        {
            var user = await _databaseContext.Users
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                throw new InvalidOperationException("User not found");
            }

            // Get consumed values for the day
            var meals = await _databaseContext.Meals
                .Where(m => m.UserId == userId && m.Date.Date == date.Date)
                .ToListAsync();

            var consumedCalories = meals.Sum(m => m.Calories);
            var consumedProtein = meals.Sum(m => m.Protein);
            var consumedCarbs = meals.Sum(m => m.Carbs);
            var consumedFat = meals.Sum(m => m.Fat);

            // Calculate required values based on user's goals and settings
            var targets = new List<TargetModel>
            {
                new TargetModel
                {
                    Label = "Energy",
                    Consumed = consumedCalories,
                    Required = user.DailyCaloriesGoal,
                    Color = "#FFFFFF" // White
                },
                new TargetModel
                {
                    Label = "Protein",
                    Consumed = consumedProtein,
                    Required = user.DailyCaloriesGoal * 0.3 / 4, // 30% of calories from protein (4 calories per gram)
                    Color = "#8CC63F" // Green
                },
                new TargetModel
                {
                    Label = "Net Carbs",
                    Consumed = consumedCarbs,
                    Required = user.DailyCaloriesGoal * 0.4 / 4, // 40% of calories from carbs (4 calories per gram)
                    Color = "#4A90E2" // Blue
                },
                new TargetModel
                {
                    Label = "Fat",
                    Consumed = consumedFat,
                    Required = user.DailyCaloriesGoal * 0.3 / 9, // 30% of calories from fat (9 calories per gram)
                    Color = "#E24A4A" // Red
                }
            };

            return new MainTargetsModel
            {
                Targets = targets
            };
        }
    }
} 