namespace Fitness_Tracker.Infrastructure
{
    using Fitness_Tracker.Data;
    using Fitness_Tracker.Data.Models;
    using Fitness_Tracker.Data.Models.Enums;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.EntityFrameworkCore;
    using System.Text.Json;
    using Fitness_Tracker.Models.Admins;
    using Fitness_Tracker.Services.Consumables;
    using Fitness_Tracker.Data.Models.Consumables;

    public static class DataSeeder
    {
        public static async Task SeedAdministratorAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();

            string roleName = "Administrator";
            IdentityResult roleResult;

            var roleExists = await roleManager.RoleExistsAsync(roleName);
            if (!roleExists)
            {
                roleResult = await roleManager.CreateAsync(new IdentityRole(roleName));
            }

            var adminUser = new User
            {
                UserName = "admin@admin.com",
                Email = "admin@admin.com",
                FullName = "Administrator",
                ActivityLevelId = 1
            };

            var adminPassword = "adminadmin";
            var user = await userManager.FindByEmailAsync("admin@admin.com");

            if (user == null)
            {
                var createAdminUser = await userManager.CreateAsync(adminUser, adminPassword);
                if (createAdminUser.Succeeded)
                {
                    await userManager.AddToRoleAsync(adminUser, "Administrator");
                }
            }
        }

        public static async Task SeedActivityLevels(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            if (!context.ActivityLevels.Any())
            {
                var activityLevels = new List<ActivityLevel>
                {
                    new ActivityLevel { Name = "No Activity", Multiplier = 1.2 },
                    new ActivityLevel { Name = "Sedentary", Multiplier = 1.375 },
                    new ActivityLevel { Name = "Lightly Active", Multiplier = 1.55 },
                    new ActivityLevel { Name = "Moderately Active", Multiplier = 1.725 },
                    new ActivityLevel { Name = "Very Active", Multiplier = 1.9 }
                };

                context.ActivityLevels.AddRange(activityLevels);
                await context.SaveChangesAsync();
            }
        }

        public static async Task SeedTestMealData(IServiceProvider serviceProvider)
        {
            if (true)
            {
                return;
            }
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();

            var testUser = await userManager.FindByEmailAsync("test@test.test");
            if (testUser == null)
            {
                return;
            }

            var existingMeals = await context.Meals
                .Where(m => m.UserId == testUser.Id)
                .AnyAsync();

            if (!existingMeals)
            {
                var today = DateTime.UtcNow.Date;
                var meals = new List<Meal>();

                for (int i = 6; i >= 0; i--)
                {
                    var date = today.AddDays(-i);
                    
                    meals.Add(new Meal
                    {
                        UserId = testUser.Id,
                        Name = "Breakfast",
                        Calories = 400,
                        Date = date,
                        MealOfTheDay = MealOfTheDay.Breakfast
                    });

                    meals.Add(new Meal
                    {
                        UserId = testUser.Id,
                        Name = "Lunch",
                        Calories = 600,
                        Date = date,
                        MealOfTheDay = MealOfTheDay.Lunch
                    });

                    meals.Add(new Meal
                    {
                        UserId = testUser.Id,
                        Name = "Dinner",
                        Calories = 500,
                        Date = date,
                        MealOfTheDay = MealOfTheDay.Dinner
                    });

                    meals.Add(new Meal
                    {
                        UserId = testUser.Id,
                        Name = "Snack",
                        Calories = 200,
                        Date = date,
                        MealOfTheDay = MealOfTheDay.Snack
                    });
                }

                await context.Meals.AddRangeAsync(meals);
                await context.SaveChangesAsync();
            }
        }

        public static async Task SeedTestUserAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();

            var testUser = await userManager.FindByEmailAsync("test@test.test");
            if (testUser == null)
            {
                testUser = new User
                {
                    UserName = "test@test.test",
                    Email = "test@test.test",
                    FullName = "Test User",
                    ActivityLevelId = 1
                };

                var result = await userManager.CreateAsync(testUser, "testtest");
                if (!result.Succeeded)
                {
                    throw new Exception("Failed to create test user: " + string.Join(", ", result.Errors.Select(e => e.Description)));
                }
            }
        }

        public static async Task SeedActivityTypesAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            // Define categories and types as in the mobile front-end
            var categoriesWithTypes = new List<(string Category, List<string> Types)>
            {
                ("Cardio", new List<string> { "Cycling", "Jumping Rope", "Running", "Swimming", "Walking" }),
                ("Gym", new List<string> { "Resistance Training", "Circuit Training" }),
                ("Outdoor Activity", new List<string> { "Hiking", "Cycling" })
            };

            foreach (var (categoryName, typeNames) in categoriesWithTypes)
            {
                var category = await context.ActivityCategories.FirstOrDefaultAsync(c => c.Name == categoryName);
                if (category == null)
                {
                    category = new ActivityCategory { Name = categoryName };
                    context.ActivityCategories.Add(category);
                    await context.SaveChangesAsync();
                }

                foreach (var typeName in typeNames)
                {
                    var exists = await context.ActivityTypes.AnyAsync(t => t.Name == typeName && t.ActivityCategoryId == category.Id);
                    if (!exists)
                    {
                        var type = new ActivityType
                        {
                            Name = typeName,
                            ActivityCategoryId = category.Id
                        };
                        context.ActivityTypes.Add(type);
                    }
                }
            }
            await context.SaveChangesAsync();
        }

        public static async Task SeedNutrientsAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            if (context.Nutrients.Any())
                return;

            var nutrients = new List<Data.Models.Consumables.Nutrient>();

            // Carbohydrates
            var carbs = new[] { "Fiber", "Starch", "Sugars", "Galactose", "Glucose", "Sucrose", "Lactose", "Maltose", "Fructose" };
            nutrients.AddRange(carbs.Select(n => new Data.Models.Consumables.Nutrient { Category = "Carbohydrates", Name = n, Amount = 0 }));

            // Amino Acids
            var aminoAcids = new[] { "Alanine", "Arginine", "AsparticAcid", "Valine", "Glycine", "Glutamine", "Isoleucine", "Leucine", "Lysine", "Methionine", "Proline", "Serine", "Tyrosine", "Threonine", "Tryptophan", "Phenylalanine", "Hydroxyproline", "Histidine", "Cystine" };
            nutrients.AddRange(aminoAcids.Select(n => new Data.Models.Consumables.Nutrient { Category = "AminoAcids", Name = n, Amount = 0 }));

            // Fats
            var fats = new[] { "TotalFats", "MonounsaturatedFats", "PolyunsaturatedFats", "SaturatedFats", "TransFats" };
            nutrients.AddRange(fats.Select(n => new Data.Models.Consumables.Nutrient { Category = "Fats", Name = n, Amount = 0 }));

            // Minerals
            var minerals = new[] { "Iron", "Potassium", "Calcium", "Magnesium", "Manganese", "Copper", "Sodium", "Selenium", "Fluoride", "Phosphorus", "Zinc" };
            nutrients.AddRange(minerals.Select(n => new Data.Models.Consumables.Nutrient { Category = "Minerals", Name = n, Amount = 0 }));

            // Other
            var other = new[] { "Alcohol", "Water", "Caffeine", "Theobromine", "Ash" };
            nutrients.AddRange(other.Select(n => new Data.Models.Consumables.Nutrient { Category = "Other", Name = n, Amount = 0 }));

            // Sterols
            var sterols = new[] { "Cholesterol", "Phytosterols", "Stigmasterols", "Campesterol", "BetaSitosterols" };
            nutrients.AddRange(sterols.Select(n => new Data.Models.Consumables.Nutrient { Category = "Sterols", Name = n, Amount = 0 }));

            // Vitamins
            var vitamins = new[] { "Betaine", "VitaminA", "VitaminB1", "VitaminB2", "VitaminB3", "VitaminB4", "VitaminB5", "VitaminB6", "VitaminB9", "VitaminB12", "VitaminC", "VitaminD", "VitaminE", "VitaminK1", "VitaminK2" };
            nutrients.AddRange(vitamins.Select(n => new Data.Models.Consumables.Nutrient { Category = "Vitamins", Name = n, Amount = 0 }));

            context.Nutrients.AddRange(nutrients);
            await context.SaveChangesAsync();
        }

        public static async Task SeedConsumableItemsAsync(IServiceProvider serviceProvider)
        {
            Console.OutputEncoding = System.Text.Encoding.UTF8;
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var consumableService = scope.ServiceProvider.GetRequiredService<IConsumableService>();

            // First clear all Nutrients (to avoid FK issues), then ConsumableItems
            var allNutrients = await context.Nutrients.ToListAsync();
            if (allNutrients.Any())
            {
                context.Nutrients.RemoveRange(allNutrients);
                await context.SaveChangesAsync();
            }
            var allConsumableItems = await context.ConsumableItems.ToListAsync();
            if (allConsumableItems.Any())
            {
                context.ConsumableItems.RemoveRange(allConsumableItems);
                await context.SaveChangesAsync();
            }

            var filePath = "consumableItem.json";
            Console.WriteLine($"[Seeder] Looking for file at: {filePath}");
            Console.WriteLine($"[Seeder] Current directory: {Directory.GetCurrentDirectory()}");
            if (!File.Exists(filePath))
            {
                Console.WriteLine($"[Seeder] File not found: {filePath}");
                return;
            }

            using var stream = File.OpenRead(filePath);
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var items = await JsonSerializer.DeserializeAsync<List<JsonElement>>(stream, options);
            if (items == null)
            {
                Console.WriteLine("[Seeder] No items found in JSON file.");
                return;
            }

            int total = items.Count;
            int inserted = 0;
            int skipped = 0;
            int errors = 0;
            Console.WriteLine($"[Seeder] Starting to seed {total} consumable items...");

            foreach (var item in items)
            {
                try
                {
                    if (!item.TryGetProperty("Title", out var titleProp) || titleProp.ValueKind != JsonValueKind.String || string.IsNullOrWhiteSpace(titleProp.GetString()))
                    {
                        Console.WriteLine("[Seeder] Skipped item with missing or null Title.");
                        skipped++;
                        continue;
                    }
                    var name = titleProp.GetString();
                    var subTitle = item.TryGetProperty("SubTitle", out var subTitleProp) && subTitleProp.ValueKind == JsonValueKind.String ? subTitleProp.GetString() : string.Empty;
                    if (await context.ConsumableItems.AnyAsync(c => c.Name == name && c.SubTitle == subTitle))
                    {
                        skipped++;
                        Console.WriteLine($"[Seeder] Skipped existing: {name} | {subTitle}");
                        continue;
                    }

                    int calories = item.TryGetProperty("CaloriesPer100g", out var cal) && cal.ValueKind == JsonValueKind.Number ? cal.GetInt32() : 0;
                    double protein = item.TryGetProperty("ProteinPer100g", out var prot) && prot.ValueKind == JsonValueKind.Number ? prot.GetDouble() : 0;
                    double carbs = item.TryGetProperty("CarbohydratesPer100g", out var carb) && carb.ValueKind == JsonValueKind.Number ? carb.GetDouble() : 0;
                    double fat = item.TryGetProperty("FatsPer100g", out var fatEl) && fatEl.ValueKind == JsonValueKind.Number ? fatEl.GetDouble() : 0;

                    var model = new AddConsumableItemModel
                    {
                        Name = name,
                        SubTitle = subTitle,
                        CaloriesPer100g = calories,
                        ProteinPer100g = protein,
                        CarbohydratePer100g = carbs,
                        FatPer100g = fat,
                        Type = TypeOfConsumable.Food, // You may want to map this from MainCategory or another field
                        NutritionalInformation = new List<Nutrient>(),
                        IsPublic = true
                    };

                    void AddNutrients(string category, JsonElement? group)
                    {
                        if (group == null || group.Value.ValueKind != JsonValueKind.Object) return;
                        foreach (var prop in group.Value.EnumerateObject())
                        {
                            if (prop.Value.ValueKind == JsonValueKind.Null) continue;
                            if (double.TryParse(prop.Value.ToString(), out var val))
                            {
                                model.NutritionalInformation.Add(new Nutrient
                                {
                                    Category = category,
                                    Name = prop.Name,
                                    Amount = val
                                });
                            }
                        }
                    }
                    AddNutrients("Carbohydrates", item.TryGetProperty("Carbohydrates", out var carbsGroup) ? carbsGroup : (JsonElement?)null);
                    AddNutrients("AminoAcids", item.TryGetProperty("AminoAcids", out var aminos) ? aminos : (JsonElement?)null);
                    AddNutrients("Fats", item.TryGetProperty("Fats", out var fats) ? fats : (JsonElement?)null);
                    AddNutrients("Minerals", item.TryGetProperty("Minerals", out var minerals) ? minerals : (JsonElement?)null);
                    AddNutrients("Other", item.TryGetProperty("Other", out var other) ? other : (JsonElement?)null);
                    AddNutrients("Sterols", item.TryGetProperty("Sterols", out var sterols) ? sterols : (JsonElement?)null);
                    AddNutrients("Vitamins", item.TryGetProperty("Vitamins", out var vitamins) ? vitamins : (JsonElement?)null);

                    await consumableService.AddConsumableItemAsync(model);
                    inserted++;
                    Console.WriteLine($"[Seeder] Inserted: {name}");
                }
                catch (Exception ex)
                {
                    errors++;
                    Console.WriteLine($"[Seeder] Error: {ex.Message}");
                }
            }
            Console.WriteLine($"[Seeder] Done. Inserted: {inserted}, Skipped: {skipped}, Errors: {errors}");
        }
    }
}
