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

        public static async Task SeedTestActivities(IServiceProvider serviceProvider)
        {
            // First ensure test user exists
            await SeedTestUserAsync(serviceProvider);

            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();

            var testUser = await userManager.FindByEmailAsync("test@test.test");
            if (testUser == null)
            {
                throw new Exception("Test user not found after creation attempt");
            }

            var today = DateTime.UtcNow.Date;

            // Check and update existing meals
            var existingMeals = await context.Meals
                .Where(m => m.UserId == testUser.Id)
                .ToListAsync();

            if (existingMeals.Any())
            {
                // Update existing meals to today's date
                foreach (var meal in existingMeals)
                {
                    meal.Date = today;
                }
            }
            else
            {
                // Create new meals for today
                var meals = new List<Meal>
                {
                    new Meal
                    {
                        UserId = testUser.Id,
                        Name = "Breakfast",
                        Calories = 400,
                        Date = today.AddHours(8), // 8:00 AM
                        MealOfTheDay = MealOfTheDay.Breakfast
                    },
                    new Meal
                    {
                        UserId = testUser.Id,
                        Name = "Lunch",
                        Calories = 600,
                        Date = today.AddHours(12).AddMinutes(30), // 12:30 PM
                        MealOfTheDay = MealOfTheDay.Lunch
                    },
                    new Meal
                    {
                        UserId = testUser.Id,
                        Name = "Dinner",
                        Calories = 500,
                        Date = today.AddHours(19), // 7:00 PM
                        MealOfTheDay = MealOfTheDay.Dinner
                    },
                    new Meal
                    {
                        UserId = testUser.Id,
                        Name = "Snack",
                        Calories = 200,
                        Date = today.AddHours(15).AddMinutes(30), // 3:30 PM
                        MealOfTheDay = MealOfTheDay.Snack
                    }
                };

                await context.Meals.AddRangeAsync(meals);
            }

            // Check and update existing activities
            var existingActivities = await context.Activities
                .Where(a => a.UserId == testUser.Id)
                .ToListAsync();

            if (existingActivities.Any())
            {
                // Update existing activities to today's date
                foreach (var activity in existingActivities)
                {
                    activity.Date = today;
                }
            }
            else
            {
                // Get or create activity categories
                var cardioCategory = await context.ActivityCategories
                    .FirstOrDefaultAsync(ac => ac.Name == "Cardio");
                
                var strengthCategory = await context.ActivityCategories
                    .FirstOrDefaultAsync(ac => ac.Name == "Strength Training");

                if (cardioCategory == null)
                {
                    cardioCategory = new ActivityCategory { Name = "Cardio" };
                    context.ActivityCategories.Add(cardioCategory);
                    await context.SaveChangesAsync();
                }

                if (strengthCategory == null)
                {
                    strengthCategory = new ActivityCategory { Name = "Strength Training" };
                    context.ActivityCategories.Add(strengthCategory);
                    await context.SaveChangesAsync();
                }

                // Get or create activity types
                var runningType = await context.ActivityTypes
                    .FirstOrDefaultAsync(at => at.Name == "Running");
                
                var weightTrainingType = await context.ActivityTypes
                    .FirstOrDefaultAsync(at => at.Name == "Weight Training");

                if (runningType == null)
                {
                    runningType = new ActivityType 
                    { 
                        Name = "Running",
                        ActivityCategoryId = cardioCategory.Id
                    };
                    context.ActivityTypes.Add(runningType);
                    await context.SaveChangesAsync();
                }

                if (weightTrainingType == null)
                {
                    weightTrainingType = new ActivityType 
                    { 
                        Name = "Weight Training",
                        ActivityCategoryId = strengthCategory.Id
                    };
                    context.ActivityTypes.Add(weightTrainingType);
                    await context.SaveChangesAsync();
                }

                // Create new activities for today
                var activities = new List<Activity>
                {
                    new Activity
                    {
                        UserId = testUser.Id,
                        ActivityTypeId = runningType.Id,
                        CaloriesBurned = 300,
                        Date = today.AddHours(7), // 7:00 AM
                        DurationInMinutes = 30,
                        TimeOfTheDay = TimeOfTheDay.Morning
                    },
                    new Activity
                    {
                        UserId = testUser.Id,
                        ActivityTypeId = weightTrainingType.Id,
                        CaloriesBurned = 250,
                        Date = today.AddHours(17), // 5:00 PM
                        DurationInMinutes = 45,
                        TimeOfTheDay = TimeOfTheDay.Evening
                    }
                };

                await context.Activities.AddRangeAsync(activities);
            }

            await context.SaveChangesAsync();
        }
    }
}
