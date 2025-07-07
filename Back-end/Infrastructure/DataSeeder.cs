namespace Fitness_Tracker.Infrastructure
{
    using Fitness_Tracker.Data;
    using Fitness_Tracker.Data.Models;
    using Fitness_Tracker.Data.Models.Enums;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.EntityFrameworkCore;

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
    }
}
