namespace Fitness_Tracker.Services.Nutrition
{
    using Fitness_Tracker.Data;
    using Fitness_Tracker.Data.Models;
    using Fitness_Tracker.Models.Nutrition;
    using Microsoft.EntityFrameworkCore;
    using System;
    using System.Linq;
    using System.Threading.Tasks;
    using System.Collections.Generic;
    using Back_end.Models.Nutrition;

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

            var startDateTime = startDate.Date;
            var endDateTime = endDate.Date.AddDays(1).AddTicks(-1);

            var dailyCalories = await _databaseContext.Meals
                .Where(m => m.UserId == userId && m.Date >= startDateTime && m.Date <= endDateTime)
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

            var result = new MacronutrientsModel
            {
                Protein = totalProtein,
                Carbs = totalCarbs,
                Fat = totalFat,
                TotalMacros = totalMacros,
                ProteinPercentage = totalMacros > 0 ? (totalProtein / totalMacros) * 100 : 0,
                CarbsPercentage = totalMacros > 0 ? (totalCarbs / totalMacros) * 100 : 0,
                FatPercentage = totalMacros > 0 ? (totalFat / totalMacros) * 100 : 0
            };
            return result;
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

            double bmr;
            if (user.Gender == Data.Models.Enums.Gender.Male)
            {
                bmr = (10 * user.Weight) + (6.25 * user.Height) - (5 * user.Age) + 5;
            }
            else
            {
                bmr = (10 * user.Weight) + (6.25 * user.Height) - (5 * user.Age) - 161;
            }

            var exerciseCalories = await _databaseContext.Activities
                .Where(a => a.UserId == userId && a.Date.Date == date.Date)
                .SumAsync(a => a.CaloriesBurned);

            var baselineActivityCalories = bmr * (user.ActivityLevel.Multiplier - 1);

            var meals = await _databaseContext.Meals
                .Where(m => m.UserId == userId && m.Date.Date == date.Date)
                .ToListAsync();

            double tefCalories = 0;
            foreach (var meal in meals)
            {
                var proteinCalories = meal.Protein * 4;
                tefCalories += proteinCalories * 0.25;

                var carbCalories = meal.Carbs * 4;
                tefCalories += carbCalories * 0.08;

                var fatCalories = meal.Fat * 9;
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

            var result = new EnergyBudgetModel
            {
                Target = target,
                Consumed = consumedCalories,
                Remaining = remaining
            };
            return result;
        }

        public async Task<MainTargetsModel> GetMainTargetsAsync(string userId, DateTime date)
        {
            var user = await _databaseContext.Users
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                throw new InvalidOperationException("User not found");
            }

            var meals = await _databaseContext.Meals
                .Where(m => m.UserId == userId && m.Date.Date == date.Date)
                .ToListAsync();

            var consumedCalories = meals.Sum(m => m.Calories);
            var consumedProtein = meals.Sum(m => m.Protein);
            var consumedCarbs = meals.Sum(m => m.Carbs);
            var consumedFat = meals.Sum(m => m.Fat);

            var targets = new List<TargetModel>
            {
                new TargetModel
                {
                    Label = "Energy",
                    Consumed = consumedCalories,
                    Required = user.DailyCaloriesGoal,
                    Color = "#FFFFFF"
                },
                new TargetModel
                {
                    Label = "Protein",
                    Consumed = consumedProtein,
                    Required = user.DailyCaloriesGoal * 0.3 / 4,
                    Color = "#8CC63F"
                },
                new TargetModel
                {
                    Label = "Net Carbs",
                    Consumed = consumedCarbs,
                    Required = user.DailyCaloriesGoal * 0.4 / 4,
                    Color = "#4A90E2"
                },
                new TargetModel
                {
                    Label = "Fat",
                    Consumed = consumedFat,
                    Required = user.DailyCaloriesGoal * 0.3 / 9,
                    Color = "#E24A4A"
                }
            };

            return new MainTargetsModel
            {
                Targets = targets
            };
        }

        public async Task<CarbohydratesModel> GetCarbohydratesAsync(string userId, DateTime date)
        {
            var user = await _databaseContext.Users
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                throw new InvalidOperationException("User not found");
            }

            var meals = await _databaseContext.Meals
                .Where(m => m.UserId == userId && m.Date.Date == date.Date)
                .ToListAsync();

            var consumableItems = await _databaseContext.ConsumableItems
                .Include(ci => ci.NutritionalInformation)
                .ToListAsync();

            var consumableItemsDict = consumableItems.ToDictionary(ci => ci.Name);

            var carbohydrateNutrients = new Dictionary<string, double>
            {
                { "Fiber", 0 },      
                { "Starch", 0 },     
                { "Sugars", 0 },     
                { "Galactose", 0 },  
                { "Glucose", 0 },    
                { "Sucrose", 0 },    
                { "Lactose", 0 },    
                { "Maltose", 0 },    
                { "Fructose", 0 }    
            };

            var result = new CarbohydratesModel();

            foreach (var nutrient in carbohydrateNutrients)
            {
                var consumed = 0.0;
                foreach (var meal in meals)
                {
                    if (consumableItemsDict.TryGetValue(meal.Name, out var consumableItem))
                    {
                        var nutrientAmount = consumableItem.NutritionalInformation
                            .Where(n => n.Category == "Carbohydrates" && n.Name == nutrient.Key)
                            .Sum(n => n.Amount);
                        consumed += nutrientAmount;
                    }
                }

                result.Nutrients.Add(new CarbohydrateNutrientModel
                {
                    Label = nutrient.Key,
                    Consumed = consumed > 0 ? consumed : null,
                    Required = nutrient.Value
                });
            }

            return result;
        }

        public async Task<AminoAcidsModel> GetAminoAcidsAsync(string userId, DateTime date)
        {
            var user = await _databaseContext.Users
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                throw new InvalidOperationException("User not found");
            }

            var meals = await _databaseContext.Meals
                .Where(m => m.UserId == userId && m.Date.Date == date.Date)
                .ToListAsync();

            var consumableItems = await _databaseContext.ConsumableItems
                .Include(ci => ci.NutritionalInformation)
                .ToListAsync();

            var consumableItemsDict = consumableItems.ToDictionary(ci => ci.Name);

            var aminoAcids = new Dictionary<string, double>
            {
                { "Alanine", 0 },
                { "Arginine", 0 },
                { "AsparticAcid", 0 },
                { "Valine", 0 },
                { "Glycine", 0 },
                { "Glutamine", 0 },
                { "Isoleucine", 0 },
                { "Leucine", 0 },
                { "Lysine", 0 },
                { "Methionine", 0 },
                { "Proline", 0 },
                { "Serine", 0 },
                { "Tyrosine", 0 },
                { "Threonine", 0 },
                { "Tryptophan", 0 },
                { "Phenylalanine", 0 },
                { "Hydroxyproline", 0 },
                { "Histidine", 0 },
                { "Cystine", 0 }
            };

            var result = new AminoAcidsModel();

            foreach (var aminoAcid in aminoAcids)
            {
                var consumed = 0.0;
                foreach (var meal in meals)
                {
                    if (consumableItemsDict.TryGetValue(meal.Name, out var consumableItem))
                    {
                        var nutrientAmount = consumableItem.NutritionalInformation
                            .Where(n => n.Category == "AminoAcids" && n.Name == aminoAcid.Key)
                            .Sum(n => n.Amount);
                        consumed += nutrientAmount;
                    }
                }

                result.Nutrients.Add(new AminoAcidNutrientModel
                {
                    Label = aminoAcid.Key,
                    Consumed = consumed > 0 ? consumed : null,
                    Required = aminoAcid.Value
                });
            }

            return result;
        }

        public async Task<FatsModel> GetFatsAsync(string userId, DateTime date)
        {
            var user = await _databaseContext.Users
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                throw new InvalidOperationException("User not found");
            }

            var meals = await _databaseContext.Meals
                .Where(m => m.UserId == userId && m.Date.Date == date.Date)
                .ToListAsync();

            var consumableItems = await _databaseContext.ConsumableItems
                .Include(ci => ci.NutritionalInformation)
                .ToListAsync();

            var consumableItemsDict = consumableItems.ToDictionary(ci => ci.Name);

            var fatNutrients = new Dictionary<string, double>
            {
                { "TotalFats", 0 },
                { "MonounsaturatedFats", 0 },
                { "PolyunsaturatedFats", 0 },
                { "SaturatedFats", 0 },
                { "TransFats", 0 }
            };

            var result = new FatsModel();

            foreach (var nutrient in fatNutrients)
            {
                var consumed = 0.0;
                foreach (var meal in meals)
                {
                    if (consumableItemsDict.TryGetValue(meal.Name, out var consumableItem))
                    {
                        var nutrientAmount = consumableItem.NutritionalInformation
                            .Where(n => n.Category == "Fats" && n.Name == nutrient.Key)
                            .Sum(n => n.Amount);
                        consumed += nutrientAmount;
                    }
                }

                result.Nutrients.Add(new FatNutrientModel
                {
                    Label = nutrient.Key,
                    Consumed = consumed > 0 ? consumed : null,
                    Required = nutrient.Value
                });
            }

            return result;
        }

        public async Task<MineralsModel> GetMineralsAsync(string userId, DateTime date)
        {
            var user = await _databaseContext.Users
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                throw new InvalidOperationException("User not found");
            }

            var meals = await _databaseContext.Meals
                .Where(m => m.UserId == userId && m.Date.Date == date.Date)
                .ToListAsync();

            var consumableItems = await _databaseContext.ConsumableItems
                .Include(ci => ci.NutritionalInformation)
                .ToListAsync();

            var consumableItemsDict = consumableItems.ToDictionary(ci => ci.Name);

            var minerals = new Dictionary<string, double>
            {
                { "Iron", 0 },
                { "Potassium", 0 },
                { "Calcium", 0 },
                { "Magnesium", 0 },
                { "Manganese", 0 },
                { "Copper", 0 },
                { "Sodium", 0 },
                { "Selenium", 0 },
                { "Fluoride", 0 },
                { "Phosphorus", 0 },
                { "Zinc", 0 }
            };

            var result = new MineralsModel();

            foreach (var mineral in minerals)
            {
                var consumed = 0.0;
                foreach (var meal in meals)
                {
                    if (consumableItemsDict.TryGetValue(meal.Name, out var consumableItem))
                    {
                        var nutrientAmount = consumableItem.NutritionalInformation
                            .Where(n => n.Category == "Minerals" && n.Name == mineral.Key)
                            .Sum(n => n.Amount);
                        consumed += nutrientAmount;
                    }
                }

                result.Nutrients.Add(new MineralNutrientModel
                {
                    Label = mineral.Key,
                    Consumed = consumed > 0 ? consumed : null,
                    Required = mineral.Value
                });
            }

            return result;
        }

        public async Task<OtherNutrientsModel> GetOtherNutrients(DateTime date)
        {
            var meals = await _databaseContext.Meals
                .Where(m => m.Date.Date == date.Date)
                .ToListAsync();

            var consumableItems = await _databaseContext.ConsumableItems
                .Include(ci => ci.NutritionalInformation)
                .ToListAsync();

            var consumableItemsDict = consumableItems.ToDictionary(ci => ci.Name);

            var otherNutrients = new Dictionary<string, double>
            {
                { "Alcohol", 10 },
                { "Water", 3000 },
                { "Caffeine", 400 },
                { "Theobromine", 100 },
                { "Ash", 10 }
            };

            var result = new OtherNutrientsModel
            {
                Date = date,
                Nutrients = new List<OtherNutrient>()
            };

            foreach (var nutrient in otherNutrients)
            {
                var consumed = 0.0;
                foreach (var meal in meals)
                {
                    if (consumableItemsDict.TryGetValue(meal.Name, out var consumableItem))
                    {
                        var nutrientAmount = consumableItem.NutritionalInformation
                            .Where(n => n.Category == "Other" && n.Name == nutrient.Key)
                            .Sum(n => n.Amount);
                        consumed += nutrientAmount;
                    }
                }

                result.Nutrients.Add(new OtherNutrient
                {
                    Label = nutrient.Key,
                    Consumed = consumed > 0 ? consumed : null,
                    Required = nutrient.Value
                });
            }

            return result;
        }

        public async Task<SterolsModel> GetSterolsAsync(string userId, DateTime date)
        {
            var user = await _databaseContext.Users
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                throw new InvalidOperationException("User not found");
            }

            var meals = await _databaseContext.Meals
                .Where(m => m.UserId == userId && m.Date.Date == date.Date)
                .ToListAsync();

            var consumableItems = await _databaseContext.ConsumableItems
                .Include(ci => ci.NutritionalInformation)
                .ToListAsync();

            var consumableItemsDict = consumableItems.ToDictionary(ci => ci.Name);

            var sterols = new Dictionary<string, double>
            {
                { "Cholesterol", 0 },
                { "Phytosterols", 0 },
                { "Stigmasterols", 0 },
                { "Campesterol", 0 },
                { "BetaSitosterols", 0 }
            };

            var result = new SterolsModel();

            foreach (var sterol in sterols)
            {
                var consumed = 0.0;
                foreach (var meal in meals)
                {
                    if (consumableItemsDict.TryGetValue(meal.Name, out var consumableItem))
                    {
                        var nutrientAmount = consumableItem.NutritionalInformation
                            .Where(n => n.Category == "Sterols" && n.Name == sterol.Key)
                            .Sum(n => n.Amount);
                        consumed += nutrientAmount;
                    }
                }

                result.Nutrients.Add(new SterolNutrientModel
                {
                    Label = sterol.Key,
                    Consumed = consumed > 0 ? consumed : null,
                    Required = sterol.Value
                });
            }

            return result;
        }

        public async Task<VitaminsModel> GetVitaminsAsync(string userId, DateTime date)
        {
            var user = await _databaseContext.Users
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                throw new InvalidOperationException("User not found");
            }

            var meals = await _databaseContext.Meals
                .Where(m => m.UserId == userId && m.Date.Date == date.Date)
                .ToListAsync();

            var consumableItems = await _databaseContext.ConsumableItems
                .Include(ci => ci.NutritionalInformation)
                .ToListAsync();

            var consumableItemsDict = consumableItems.ToDictionary(ci => ci.Name);

            var vitamins = new Dictionary<string, double>
            {
                { "Betaine", 0 },
                { "VitaminA", 0 },
                { "VitaminB1", 0 },
                { "VitaminB2", 0 },
                { "VitaminB3", 0 },
                { "VitaminB4", 0 },
                { "VitaminB5", 0 },
                { "VitaminB6", 0 },
                { "VitaminB9", 0 },
                { "VitaminB12", 0 },
                { "VitaminC", 0 },
                { "VitaminD", 0 },
                { "VitaminE", 0 },
                { "VitaminK1", 0 },
                { "VitaminK2", 0 }
            };

            var result = new VitaminsModel();

            foreach (var vitamin in vitamins)
            {
                var consumed = 0.0;
                foreach (var meal in meals)
                {
                    if (consumableItemsDict.TryGetValue(meal.Name, out var consumableItem))
                    {
                        var nutrientAmount = consumableItem.NutritionalInformation
                            .Where(n => n.Category == "Vitamins" && n.Name == vitamin.Key)
                            .Sum(n => n.Amount);
                        consumed += nutrientAmount;
                    }
                }

                result.Nutrients.Add(new VitaminNutrientModel
                {
                    Label = vitamin.Key,
                    Consumed = consumed > 0 ? consumed : null,
                    Required = vitamin.Value
                });
            }

            return result;
        }

        public async Task<EnergySettingsModel> GetEnergySettingsAsync(string userId, double? customBmr, int? activityLevelId, bool includeTef)
        {
            var user = await _databaseContext.Users
                .Include(u => u.ActivityLevel)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                throw new InvalidOperationException("User not found");
            }

            double bmr;
            if (customBmr.HasValue && customBmr.Value > 0)
            {
                bmr = customBmr.Value;
            }
            else if (user.Weight > 0 && user.Height > 0 && user.Age > 0)
            {
                if (user.Gender == Data.Models.Enums.Gender.Male)
                {
                    bmr = (10 * user.Weight) + (6.25 * user.Height) - (5 * user.Age) + 5;
                }
                else
                {
                    bmr = (10 * user.Weight) + (6.25 * user.Height) - (5 * user.Age) - 161;
                }
            }
            else
            {
                bmr = 0;
            }

            ActivityLevel activityLevel = null;
            if (activityLevelId.HasValue)
            {
                activityLevel = await _databaseContext.ActivityLevels.FirstOrDefaultAsync(al => al.Id == activityLevelId.Value);
            }
            if (activityLevel == null)
            {
                activityLevel = user.ActivityLevel;
            }
            if (activityLevel == null)
            {
                activityLevel = await _databaseContext.ActivityLevels.OrderBy(al => al.Id).FirstOrDefaultAsync();
            }

            double multiplier = activityLevel?.Multiplier ?? 1.2;
            string activityLevelName = activityLevel?.Name ?? "Unknown";
            int activityLevelIdResult = activityLevel?.Id ?? 0;

            double maintenance = bmr * multiplier;
            if (includeTef)
            {
                maintenance *= 1.1;
            }

            return new EnergySettingsModel
            {
                BMR = Math.Round(bmr, 1),
                MaintenanceCalories = Math.Round(maintenance, 1),
                ActivityLevelId = activityLevelIdResult,
                ActivityLevelName = activityLevelName,
                ActivityMultiplier = multiplier,
                TEFIncluded = includeTef
            };
        }

        public async Task<List<UserNutrientTargetModel>> GetUserNutrientTargetsAsync(string userId)
        {
            var allNutrients = await _databaseContext.Nutrients
                .Select(n => new { n.Name, n.Category })
                .Distinct()
                .ToListAsync();

            var userTargets = await _databaseContext.UserNutrientTargets
                .Where(t => t.UserId == userId)
                .ToListAsync();

            var result = new List<UserNutrientTargetModel>();

            foreach (var nutrient in allNutrients)
            {
                var userTarget = userTargets.FirstOrDefault(t => t.NutrientName == nutrient.Name && t.Category == nutrient.Category);
                if (userTarget != null)
                {
                    result.Add(new UserNutrientTargetModel
                    {
                        Id = userTarget.Id,
                        NutrientName = userTarget.NutrientName,
                        Category = userTarget.Category,
                        IsTracked = userTarget.IsTracked,
                        DailyTarget = userTarget.DailyTarget,
                        HasMaxThreshold = userTarget.HasMaxThreshold,
                        MaxThreshold = userTarget.MaxThreshold
                    });
                }
                else
                {
                    result.Add(new UserNutrientTargetModel
                    {
                        Id = 0,
                        NutrientName = nutrient.Name,
                        Category = nutrient.Category,
                        IsTracked = false,
                        DailyTarget = null,
                        HasMaxThreshold = false,
                        MaxThreshold = null
                    });
                }
            }

            return result;
        }

        public async Task<UserNutrientTargetModel> UpdateUserNutrientTargetAsync(string userId, UpdateUserNutrientTargetModel model)
        {
            var entity = await _databaseContext.UserNutrientTargets
                .FirstOrDefaultAsync(t => t.UserId == userId && t.NutrientName == model.NutrientName && t.Category == model.Category);

            if (entity == null)
            {
                entity = new UserNutrientTarget
                {
                    UserId = userId,
                    NutrientName = model.NutrientName,
                    Category = model.Category
                };
                _databaseContext.UserNutrientTargets.Add(entity);
            }

            entity.IsTracked = model.IsTracked;
            entity.DailyTarget = model.DailyTarget;
            entity.HasMaxThreshold = model.HasMaxThreshold;
            entity.MaxThreshold = model.MaxThreshold;

            await _databaseContext.SaveChangesAsync();

            return new UserNutrientTargetModel
            {
                Id = entity.Id,
                NutrientName = entity.NutrientName,
                Category = entity.Category,
                IsTracked = entity.IsTracked,
                DailyTarget = entity.DailyTarget,
                HasMaxThreshold = entity.HasMaxThreshold,
                MaxThreshold = entity.MaxThreshold
            };
        }
    }
} 