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


            var categoriesWithTypes = new List<(string Category, List<string> Types)>
            {
                ("Cardio", new List<string> { "Cycling", "Running", "Swimming", "Walking" }),
                ("Cardio Machines", new List<string> { "Rowing Machine", "Elliptical Trainer", "Stair Stepping" }),
                ("Gym", new List<string> { "Resistance Training", "Circuit Training", "Calisthenics" }),
                ("Outdoor Activity", new List<string> { "Hiking" }),
                ("Sports", new List<string> { "Basketball", "Soccer", "Tennis", "Volleyball", "Badminton" }),
                ("Water Sports", new List<string> { "Kayaking", "Canoeing" }),
                ("Winter Sports", new List<string> { "Skiing (Downhill)", "Snowboarding", "Ice Skating" }),
                ("Dance", new List<string> { "Dancing" })
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
                            ActivityCategoryId = category.Id,
                            IsPublic = true
                        };
                        context.ActivityTypes.Add(type);
                    }
                    else
                    {

                        var existing = await context.ActivityTypes.FirstAsync(t => t.Name == typeName && t.ActivityCategoryId == category.Id);
                        if (!existing.IsPublic)
                        {
                            existing.IsPublic = true;
                        }
                    }
                }
            }
            await context.SaveChangesAsync();

                async Task<int> EnsureTypeIdAsync(string categoryName, string typeName)
                {
                    var type = await context.ActivityTypes
                        .Include(t => t.ActivityCategory)
                        .FirstOrDefaultAsync(t => t.Name == typeName && t.ActivityCategory.Name == categoryName);
                    if (type == null)
                    {
                        var category = await context.ActivityCategories.FirstOrDefaultAsync(c => c.Name == categoryName) 
                            ?? new ActivityCategory { Name = categoryName };
                        if (category.Id == 0)
                        {
                            context.ActivityCategories.Add(category);
                            await context.SaveChangesAsync();
                        }
                        type = new ActivityType { Name = typeName, ActivityCategoryId = category.Id, IsPublic = true };
                        context.ActivityTypes.Add(type);
                        await context.SaveChangesAsync();
                    }
                    return type.Id;
                }


                var cyclingTypeId = await EnsureTypeIdAsync("Cardio", "Cycling");
                var cyclingExercises = new[]
                {
                    ("Mountain Cycling", new (string Key, float Met)[]{ ("Low", 6.8f), ("Moderate", 8.5f), ("Hard", 10.0f) }),
                    ("Road Biking", new (string Key, float)[]{ ("Low", 6.8f), ("Moderate", 8.0f), ("Hard", 10.0f) }),
                    ("Stationary Bike", new (string Key, float)[]{ ("Low", 3.5f), ("Moderate", 5.5f), ("Hard", 7.0f) })
                };
                foreach (var (name, profiles) in cyclingExercises)
                {
                    var existsEx = await context.ActivityExercises.AnyAsync(e => e.Name == name && e.ActivityTypeId == cyclingTypeId);
                    if (!existsEx)
                    {
                        var exercise = new ActivityExercise { Name = name, ActivityTypeId = cyclingTypeId, IsPublic = true };
                        foreach (var (key, met) in profiles)
                        {
                            exercise.MetProfiles.Add(new ExerciseMetProfile { Key = key, Met = met });
                        }
                        context.ActivityExercises.Add(exercise);
                    }
                }

                // Outdoor Activity → Hiking with terrain keys
                var hikingTypeId = await EnsureTypeIdAsync("Outdoor Activity", "Hiking");
                if (!await context.ActivityExercises.AnyAsync(e => e.ActivityTypeId == hikingTypeId && e.Name == "Trail Hiking"))
                {
                    var hiking = new ActivityExercise { Name = "Trail Hiking", ActivityTypeId = hikingTypeId, IsPublic = true };
                    hiking.MetProfiles.Add(new ExerciseMetProfile { Key = "Easy trail", Met = 6.0f });
                    hiking.MetProfiles.Add(new ExerciseMetProfile { Key = "Moderate incline", Met = 6.5f });
                    hiking.MetProfiles.Add(new ExerciseMetProfile { Key = "Steep or rough terrain", Met = 7.8f });
                    context.ActivityExercises.Add(hiking);
                }

                // Outdoor Activity → Cycling (different from indoor Cardio cycling)
                var outdoorCyclingTypeId = await EnsureTypeIdAsync("Outdoor Activity", "Cycling");
                var outdoorCyclingExercises = new[]
                {
                    ("Outdoor Road Cycling", new (string Key, float)[]{ ("Low", 4.0f), ("Moderate", 6.8f), ("Hard", 8.0f), ("Maximal", 10.0f) }),
                    ("Mountain Biking", new (string Key, float)[]{ ("Low", 6.8f), ("Moderate", 8.5f), ("Hard", 10.0f), ("Maximal", 12.0f) }),
                    ("Recreational Cycling", new (string Key, float)[]{ ("Low", 4.0f), ("Moderate", 6.8f), ("Hard", 8.0f) })
                };
                foreach (var (name, profiles) in outdoorCyclingExercises)
                {
                    if (!await context.ActivityExercises.AnyAsync(e => e.Name == name && e.ActivityTypeId == outdoorCyclingTypeId))
                    {
                        var ex = new ActivityExercise { Name = name, ActivityTypeId = outdoorCyclingTypeId, IsPublic = true };
                        foreach (var (key, met) in profiles) ex.MetProfiles.Add(new ExerciseMetProfile { Key = key, Met = met });
                        context.ActivityExercises.Add(ex);
                    }
                }

                // Running
                var runningTypeId = await EnsureTypeIdAsync("Cardio", "Running");
                var runningList = new[]
                {
                    ("Easy Jog", new (string Key, float)[]{ ("Low", 8.3f), ("Moderate", 9.0f), ("Hard", 10.0f) }),
                    ("Steady Run", new (string Key, float)[]{ ("Low", 8.3f), ("Moderate", 9.8f), ("Hard", 11.0f) }),
                    ("Tempo Run", new (string Key, float)[]{ ("Low", 9.0f), ("Moderate", 10.5f), ("Hard", 11.5f) })
                };
                foreach (var (name, profiles) in runningList)
                {
                    if (!await context.ActivityExercises.AnyAsync(e => e.Name == name && e.ActivityTypeId == runningTypeId))
                    {
                        var ex = new ActivityExercise { Name = name, ActivityTypeId = runningTypeId, IsPublic = true };
                        foreach (var (key, met) in profiles) ex.MetProfiles.Add(new ExerciseMetProfile { Key = key, Met = met });
                        context.ActivityExercises.Add(ex);
                    }
                }

                // Swimming
                var swimmingTypeId = await EnsureTypeIdAsync("Cardio", "Swimming");
                if (!await context.ActivityExercises.AnyAsync(e => e.ActivityTypeId == swimmingTypeId && e.Name == "Lap Swimming"))
                {
                    var swimming = new ActivityExercise { Name = "Lap Swimming", ActivityTypeId = swimmingTypeId, IsPublic = true };
                    swimming.MetProfiles.Add(new ExerciseMetProfile { Key = "Low", Met = 6.0f });
                    swimming.MetProfiles.Add(new ExerciseMetProfile { Key = "Moderate", Met = 8.0f });
                    swimming.MetProfiles.Add(new ExerciseMetProfile { Key = "Hard", Met = 10.0f });
                    context.ActivityExercises.Add(swimming);
                }

                // Resistance Training
                var resistanceTypeId = await EnsureTypeIdAsync("Gym", "Resistance Training");
                if (!await context.ActivityExercises.AnyAsync(e => e.ActivityTypeId == resistanceTypeId && e.Name == "Free Weights/Machines"))
                {
                    var resistance = new ActivityExercise { Name = "Free Weights/Machines", ActivityTypeId = resistanceTypeId, IsPublic = true };
                    resistance.MetProfiles.Add(new ExerciseMetProfile { Key = "Low", Met = 3.5f });
                    resistance.MetProfiles.Add(new ExerciseMetProfile { Key = "Moderate", Met = 5.0f });
                    resistance.MetProfiles.Add(new ExerciseMetProfile { Key = "Hard", Met = 6.0f });
                    context.ActivityExercises.Add(resistance);
                }

                // Running exercises with varied intensities
                var runningExercises = new[]
                {
                    ("Easy Jog", new (string Key, float)[]{ ("Low", 8.3f), ("Moderate", 9.0f), ("Hard", 10.0f) }),
                    ("Steady Run", new (string Key, float)[]{ ("Low", 8.3f), ("Moderate", 9.8f), ("Hard", 11.0f) }),
                    ("Tempo Run", new (string Key, float)[]{ ("Low", 9.0f), ("Moderate", 10.5f), ("Hard", 11.5f) })
                };
                foreach (var (name, profiles) in runningExercises)
                {
                    if (!await context.ActivityExercises.AnyAsync(e => e.Name == name && e.ActivityTypeId == runningTypeId))
                    {
                        var ex = new ActivityExercise { Name = name, ActivityTypeId = runningTypeId, IsPublic = true };
                        foreach (var (key, met) in profiles) ex.MetProfiles.Add(new ExerciseMetProfile { Key = key, Met = met });
                        context.ActivityExercises.Add(ex);
                    }
                }

                // Jumping Rope as separate activity type
                var jumpingRopeTypeId = await EnsureTypeIdAsync("Cardio", "Jumping Rope");
                if (!await context.ActivityExercises.AnyAsync(e => e.ActivityTypeId == jumpingRopeTypeId && e.Name == "Jump Rope Session"))
                {
                    var jumpRope = new ActivityExercise { Name = "Jump Rope Session", ActivityTypeId = jumpingRopeTypeId, IsPublic = true };
                    jumpRope.MetProfiles.Add(new ExerciseMetProfile { Key = "Low", Met = 8.8f });
                    jumpRope.MetProfiles.Add(new ExerciseMetProfile { Key = "Moderate", Met = 11.8f });
                    jumpRope.MetProfiles.Add(new ExerciseMetProfile { Key = "Hard", Met = 12.3f });
                    context.ActivityExercises.Add(jumpRope);
                }

                // Walking exercises
                var walkingTypeId = await EnsureTypeIdAsync("Cardio", "Walking");
                var walkingExercises = new[]
                {
                    ("Casual Walk", new (string Key, float)[]{ ("Low", 2.0f), ("Moderate", 3.5f), ("Hard", 4.3f) }),
                    ("Brisk Walk", new (string Key, float)[]{ ("Low", 3.5f), ("Moderate", 4.3f), ("Hard", 5.0f) }),
                    ("Power Walk", new (string Key, float)[]{ ("Low", 4.3f), ("Moderate", 5.0f), ("Hard", 6.3f) })
                };
                foreach (var (name, profiles) in walkingExercises)
                {
                    if (!await context.ActivityExercises.AnyAsync(e => e.Name == name && e.ActivityTypeId == walkingTypeId))
                    {
                        var ex = new ActivityExercise { Name = name, ActivityTypeId = walkingTypeId, IsPublic = true };
                        foreach (var (key, met) in profiles) ex.MetProfiles.Add(new ExerciseMetProfile { Key = key, Met = met });
                        context.ActivityExercises.Add(ex);
                    }
                }

                // Cardio Machines
                var rowingMachineTypeId = await EnsureTypeIdAsync("Cardio Machines", "Rowing Machine");
                if (!await context.ActivityExercises.AnyAsync(e => e.ActivityTypeId == rowingMachineTypeId && e.Name == "Indoor Row"))
                {
                    var rower = new ActivityExercise { Name = "Indoor Row", ActivityTypeId = rowingMachineTypeId, IsPublic = true };
                    rower.MetProfiles.Add(new ExerciseMetProfile { Key = "Low", Met = 4.8f });
                    rower.MetProfiles.Add(new ExerciseMetProfile { Key = "Moderate", Met = 7.0f });
                    rower.MetProfiles.Add(new ExerciseMetProfile { Key = "Hard", Met = 8.5f });
                    context.ActivityExercises.Add(rower);
                }
                var ellipticalTypeId = await EnsureTypeIdAsync("Cardio Machines", "Elliptical Trainer");
                if (!await context.ActivityExercises.AnyAsync(e => e.ActivityTypeId == ellipticalTypeId && e.Name == "Elliptical Session"))
                {
                    var ell = new ActivityExercise { Name = "Elliptical Session", ActivityTypeId = ellipticalTypeId, IsPublic = true };
                    ell.MetProfiles.Add(new ExerciseMetProfile { Key = "Low", Met = 5.0f });
                    ell.MetProfiles.Add(new ExerciseMetProfile { Key = "Moderate", Met = 6.5f });
                    ell.MetProfiles.Add(new ExerciseMetProfile { Key = "Hard", Met = 8.0f });
                    context.ActivityExercises.Add(ell);
                }
                var stairTypeId = await EnsureTypeIdAsync("Cardio Machines", "Stair Stepping");
                if (!await context.ActivityExercises.AnyAsync(e => e.ActivityTypeId == stairTypeId && e.Name == "Stair Climber"))
                {
                    var stairs = new ActivityExercise { Name = "Stair Climber", ActivityTypeId = stairTypeId, IsPublic = true };
                    stairs.MetProfiles.Add(new ExerciseMetProfile { Key = "Low", Met = 6.0f });
                    stairs.MetProfiles.Add(new ExerciseMetProfile { Key = "Moderate", Met = 8.0f });
                    stairs.MetProfiles.Add(new ExerciseMetProfile { Key = "Hard", Met = 9.0f });
                    context.ActivityExercises.Add(stairs);
                }

                // Gym extras
                var circuitTypeId = await EnsureTypeIdAsync("Gym", "Circuit Training");
                if (!await context.ActivityExercises.AnyAsync(e => e.ActivityTypeId == circuitTypeId && e.Name == "Circuit Rounds"))
                {
                    var circuit = new ActivityExercise { Name = "Circuit Rounds", ActivityTypeId = circuitTypeId, IsPublic = true };
                    circuit.MetProfiles.Add(new ExerciseMetProfile { Key = "Low", Met = 7.0f });
                    circuit.MetProfiles.Add(new ExerciseMetProfile { Key = "Moderate", Met = 8.0f });
                    circuit.MetProfiles.Add(new ExerciseMetProfile { Key = "Hard", Met = 9.0f });
                    context.ActivityExercises.Add(circuit);
                }
                var calisthenicsTypeId = await EnsureTypeIdAsync("Gym", "Calisthenics");
                if (!await context.ActivityExercises.AnyAsync(e => e.ActivityTypeId == calisthenicsTypeId && e.Name == "Bodyweight Session"))
                {
                    var cal = new ActivityExercise { Name = "Bodyweight Session", ActivityTypeId = calisthenicsTypeId, IsPublic = true };
                    cal.MetProfiles.Add(new ExerciseMetProfile { Key = "Low", Met = 4.0f });
                    cal.MetProfiles.Add(new ExerciseMetProfile { Key = "Moderate", Met = 6.0f });
                    cal.MetProfiles.Add(new ExerciseMetProfile { Key = "Hard", Met = 8.0f });
                    context.ActivityExercises.Add(cal);
                }

                // Sports
                var basketballTypeId = await EnsureTypeIdAsync("Sports", "Basketball");
                if (!await context.ActivityExercises.AnyAsync(e => e.ActivityTypeId == basketballTypeId && e.Name == "Basketball Play"))
                {
                    var bb = new ActivityExercise { Name = "Basketball Play", ActivityTypeId = basketballTypeId, IsPublic = true };
                    bb.MetProfiles.Add(new ExerciseMetProfile { Key = "Low", Met = 6.5f });
                    bb.MetProfiles.Add(new ExerciseMetProfile { Key = "Moderate", Met = 8.0f });
                    bb.MetProfiles.Add(new ExerciseMetProfile { Key = "Hard", Met = 10.0f });
                    context.ActivityExercises.Add(bb);
                }
                var soccerTypeId = await EnsureTypeIdAsync("Sports", "Soccer");
                if (!await context.ActivityExercises.AnyAsync(e => e.ActivityTypeId == soccerTypeId && e.Name == "Football (Soccer)"))
                {
                    var soc = new ActivityExercise { Name = "Football (Soccer)", ActivityTypeId = soccerTypeId, IsPublic = true };
                    soc.MetProfiles.Add(new ExerciseMetProfile { Key = "Low", Met = 7.0f });
                    soc.MetProfiles.Add(new ExerciseMetProfile { Key = "Moderate", Met = 10.0f });
                    soc.MetProfiles.Add(new ExerciseMetProfile { Key = "Hard", Met = 11.0f });
                    context.ActivityExercises.Add(soc);
                }
                var tennisTypeId = await EnsureTypeIdAsync("Sports", "Tennis");
                if (!await context.ActivityExercises.AnyAsync(e => e.ActivityTypeId == tennisTypeId && e.Name == "Tennis Session"))
                {
                    var ten = new ActivityExercise { Name = "Tennis Session", ActivityTypeId = tennisTypeId, IsPublic = true };
                    ten.MetProfiles.Add(new ExerciseMetProfile { Key = "Low", Met = 5.0f });
                    ten.MetProfiles.Add(new ExerciseMetProfile { Key = "Moderate", Met = 7.0f });
                    ten.MetProfiles.Add(new ExerciseMetProfile { Key = "Hard", Met = 8.0f });
                    context.ActivityExercises.Add(ten);
                }
                var volleyballTypeId = await EnsureTypeIdAsync("Sports", "Volleyball");
                if (!await context.ActivityExercises.AnyAsync(e => e.ActivityTypeId == volleyballTypeId && e.Name == "Volleyball"))
                {
                    var vb = new ActivityExercise { Name = "Volleyball", ActivityTypeId = volleyballTypeId, IsPublic = true };
                    vb.MetProfiles.Add(new ExerciseMetProfile { Key = "Low", Met = 3.5f });
                    vb.MetProfiles.Add(new ExerciseMetProfile { Key = "Moderate", Met = 6.0f });
                    vb.MetProfiles.Add(new ExerciseMetProfile { Key = "Hard", Met = 7.0f });
                    context.ActivityExercises.Add(vb);
                }
                var badmintonTypeId = await EnsureTypeIdAsync("Sports", "Badminton");
                if (!await context.ActivityExercises.AnyAsync(e => e.ActivityTypeId == badmintonTypeId && e.Name == "Badminton"))
                {
                    var bd = new ActivityExercise { Name = "Badminton", ActivityTypeId = badmintonTypeId, IsPublic = true };
                    bd.MetProfiles.Add(new ExerciseMetProfile { Key = "Low", Met = 5.5f });
                    bd.MetProfiles.Add(new ExerciseMetProfile { Key = "Moderate", Met = 7.0f });
                    bd.MetProfiles.Add(new ExerciseMetProfile { Key = "Hard", Met = 8.0f });
                    context.ActivityExercises.Add(bd);
                }

                // Water Sports
                var kayakingTypeId = await EnsureTypeIdAsync("Water Sports", "Kayaking");
                if (!await context.ActivityExercises.AnyAsync(e => e.ActivityTypeId == kayakingTypeId && e.Name == "Kayak Paddling"))
                {
                    var ky = new ActivityExercise { Name = "Kayak Paddling", ActivityTypeId = kayakingTypeId, IsPublic = true };
                    ky.MetProfiles.Add(new ExerciseMetProfile { Key = "Low", Met = 4.0f });
                    ky.MetProfiles.Add(new ExerciseMetProfile { Key = "Moderate", Met = 5.0f });
                    ky.MetProfiles.Add(new ExerciseMetProfile { Key = "Hard", Met = 7.0f });
                    context.ActivityExercises.Add(ky);
                }
                var canoeTypeId = await EnsureTypeIdAsync("Water Sports", "Canoeing");
                if (!await context.ActivityExercises.AnyAsync(e => e.ActivityTypeId == canoeTypeId && e.Name == "Canoe Paddling"))
                {
                    var cn = new ActivityExercise { Name = "Canoe Paddling", ActivityTypeId = canoeTypeId, IsPublic = true };
                    cn.MetProfiles.Add(new ExerciseMetProfile { Key = "Low", Met = 3.5f });
                    cn.MetProfiles.Add(new ExerciseMetProfile { Key = "Moderate", Met = 5.0f });
                    cn.MetProfiles.Add(new ExerciseMetProfile { Key = "Hard", Met = 7.0f });
                    context.ActivityExercises.Add(cn);
                }

                // Winter Sports
                var skiTypeId = await EnsureTypeIdAsync("Winter Sports", "Skiing (Downhill)");
                if (!await context.ActivityExercises.AnyAsync(e => e.ActivityTypeId == skiTypeId && e.Name == "Downhill Skiing"))
                {
                    var ski = new ActivityExercise { Name = "Downhill Skiing", ActivityTypeId = skiTypeId, IsPublic = true };
                    ski.MetProfiles.Add(new ExerciseMetProfile { Key = "Low", Met = 6.0f });
                    ski.MetProfiles.Add(new ExerciseMetProfile { Key = "Moderate", Met = 8.0f });
                    ski.MetProfiles.Add(new ExerciseMetProfile { Key = "Hard", Met = 10.0f });
                    context.ActivityExercises.Add(ski);
                }
                var snowboardTypeId = await EnsureTypeIdAsync("Winter Sports", "Snowboarding");
                if (!await context.ActivityExercises.AnyAsync(e => e.ActivityTypeId == snowboardTypeId && e.Name == "Snowboarding"))
                {
                    var sb = new ActivityExercise { Name = "Snowboarding", ActivityTypeId = snowboardTypeId, IsPublic = true };
                    sb.MetProfiles.Add(new ExerciseMetProfile { Key = "Low", Met = 5.0f });
                    sb.MetProfiles.Add(new ExerciseMetProfile { Key = "Moderate", Met = 6.5f });
                    sb.MetProfiles.Add(new ExerciseMetProfile { Key = "Hard", Met = 8.0f });
                    context.ActivityExercises.Add(sb);
                }
                var iceTypeId = await EnsureTypeIdAsync("Winter Sports", "Ice Skating");
                if (!await context.ActivityExercises.AnyAsync(e => e.ActivityTypeId == iceTypeId && e.Name == "Ice Skating"))
                {
                    var ice = new ActivityExercise { Name = "Ice Skating", ActivityTypeId = iceTypeId, IsPublic = true };
                    ice.MetProfiles.Add(new ExerciseMetProfile { Key = "Low", Met = 5.5f });
                    ice.MetProfiles.Add(new ExerciseMetProfile { Key = "Moderate", Met = 7.0f });
                    ice.MetProfiles.Add(new ExerciseMetProfile { Key = "Hard", Met = 9.0f });
                    context.ActivityExercises.Add(ice);
                }

                // Dance
                var danceTypeId = await EnsureTypeIdAsync("Dance", "Dancing");
                if (!await context.ActivityExercises.AnyAsync(e => e.ActivityTypeId == danceTypeId && e.Name == "Dance Workout"))
                {
                    var dance = new ActivityExercise { Name = "Dance Workout", ActivityTypeId = danceTypeId, IsPublic = true };
                    dance.MetProfiles.Add(new ExerciseMetProfile { Key = "Low", Met = 5.0f });
                    dance.MetProfiles.Add(new ExerciseMetProfile { Key = "Moderate", Met = 7.0f });
                    dance.MetProfiles.Add(new ExerciseMetProfile { Key = "Hard", Met = 9.0f });
                    context.ActivityExercises.Add(dance);
                }

            await context.SaveChangesAsync();
        }

        public static async Task SeedNutrientsAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            if (context.Nutrients.Any())
                return;

            var nutrients = new List<Nutrient>();

            // Carbohydrates
            var carbs = new[] { "Fiber", "Starch", "Sugars", "Galactose", "Glucose", "Sucrose", "Lactose", "Maltose", "Fructose" };
            nutrients.AddRange(carbs.Select(n => new Nutrient { Category = "Carbohydrates", Name = n, Amount = 0 }));

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

            // Check if data already exists - if so, skip seeding entirely
            if (context.ConsumableItems.Any())
            {
                Console.WriteLine("[Seeder] Consumable items already exist in database. Skipping seeding.");
                return;
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
                    // Fix SubTitle assignment
                    string? subTitle = null;
                    if (item.TryGetProperty("SubTitle", out var subTitleProp) && subTitleProp.ValueKind == JsonValueKind.String)
                    {
                        var val = subTitleProp.GetString();
                        if (!string.IsNullOrWhiteSpace(val))
                            subTitle = val;
                    }
                    // Get macronutrients first for duplicate checking
                    int calories = item.TryGetProperty("CaloriesPer100g", out var cal) && cal.ValueKind == JsonValueKind.Number ? cal.GetInt32() : 0;
                    double protein = item.TryGetProperty("ProteinPer100g", out var prot) && prot.ValueKind == JsonValueKind.Number ? prot.GetDouble() : 0;
                    double carbs = item.TryGetProperty("CarbohydratesPer100g", out var carb) && carb.ValueKind == JsonValueKind.Number ? carb.GetDouble() : 0;
                    double fat = item.TryGetProperty("FatsPer100g", out var fatEl) && fatEl.ValueKind == JsonValueKind.Number ? fatEl.GetDouble() : 0;

                    // Check for existing items using precise matching (name + subtitle + macronutrients)
                    var existingItems = await context.ConsumableItems
                        .Where(c => c.Name == name)
                        .ToListAsync();

                    bool itemExists = false;
                    foreach (var existing in existingItems)
                    {
                        if (existing.SubTitle == subTitle &&
                            existing.CaloriesPer100g == calories &&
                            existing.ProteinPer100g == protein &&
                            existing.CarbohydratePer100g == carbs &&
                            existing.FatPer100g == fat)
                        {
                            itemExists = true;
                            break;
                        }
                    }

                    if (itemExists)
                    {
                        skipped++;
                        Console.WriteLine($"[Seeder] Skipped existing: {name} | {subTitle}");
                        continue;
                    }

                    // Get MainCategory from JSON
                    string? mainCategory = null;
                    if (item.TryGetProperty("MainCategory", out var mainCategoryProp) && mainCategoryProp.ValueKind == JsonValueKind.String)
                    {
                        var val = mainCategoryProp.GetString();
                        if (!string.IsNullOrWhiteSpace(val))
                            mainCategory = val;
                    }

                    var model = new AddConsumableItemModel
                    {
                        Name = name,
                        SubTitle = subTitle,
                        MainCategory = mainCategory,
                        CaloriesPer100g = calories,
                        ProteinPer100g = protein,
                        CarbohydratePer100g = carbs,
                        FatPer100g = fat,
                        Type = TypeOfConsumable.Food,
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

        public static async Task SeedConsumableItemSubtitlesAsync(IServiceProvider serviceProvider)
        {
            Console.OutputEncoding = System.Text.Encoding.UTF8;
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var filePath = "consumableItem.json";
            Console.WriteLine($"[SubTitle Seeder] Looking for file at: {filePath}");
            
            if (!File.Exists(filePath))
            {
                Console.WriteLine($"[SubTitle Seeder] File not found: {filePath}");
                return;
            }

            using var stream = File.OpenRead(filePath);
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var items = await JsonSerializer.DeserializeAsync<List<JsonElement>>(stream, options);
            
            if (items == null)
            {
                Console.WriteLine("[SubTitle Seeder] No items found in JSON file.");
                return;
            }

            int updated = 0;
            int skipped = 0;
            int errors = 0;
            int notFound = 0;
            Console.WriteLine($"[SubTitle Seeder] Starting to update subtitles for {items.Count} items...");
            var usedItemIds = new HashSet<int>();

            foreach (var item in items)
            {
                try
                {
                    if (!item.TryGetProperty("Title", out var titleProp) || titleProp.ValueKind != JsonValueKind.String || string.IsNullOrWhiteSpace(titleProp.GetString()))
                    {
                        skipped++;
                        continue;
                    }

                    var name = titleProp.GetString();
                    string? subTitle = null;
                    
                    if (item.TryGetProperty("SubTitle", out var subTitleProp) && subTitleProp.ValueKind == JsonValueKind.String)
                    {
                        var val = subTitleProp.GetString();
                        if (!string.IsNullOrWhiteSpace(val))
                            subTitle = val;
                    }

                    if (string.IsNullOrWhiteSpace(subTitle))
                    {
                        skipped++;
                        continue;
                    }

                    // Use macronutrients to disambiguate duplicate titles
                    int calories = GetSafeInteger(item, "CaloriesPer100g");
                    double protein = GetSafeDouble(item, "ProteinPer100g");
                    double carbs = GetSafeDouble(item, "CarbohydratesPer100g");
                    double fat = GetSafeDouble(item, "FatsPer100g");

                    var potentialMatches = await context.ConsumableItems
                        .Where(c => c.Name == name)
                        .ToListAsync();

                    if (potentialMatches.Count == 0)
                    {
                        notFound++;
                        if (notFound <= 10)
                            Console.WriteLine($"[SubTitle Seeder] NOT FOUND in DB: {name}");
                        continue;
                    }

                    var candidates = potentialMatches
                        .Where(c => string.IsNullOrEmpty(c.SubTitle) && !usedItemIds.Contains(c.Id))
                        .ToList();

                    if (candidates.Count == 0)
                    {
                        skipped++;
                        continue;
                    }

                    var bestMatch = FindBestMatch(candidates, subTitle, calories, protein, carbs, fat);
                    if (bestMatch != null)
                    {
                        bestMatch.SubTitle = subTitle;
                        usedItemIds.Add(bestMatch.Id);
                        updated++;
                        if (updated <= 20)
                            Console.WriteLine($"[SubTitle Seeder] Updated: {name} | {subTitle}");
                    }
                    else
                    {
                        skipped++;
                    }
                }
                catch (Exception ex)
                {
                    errors++;
                    Console.WriteLine($"[SubTitle Seeder] Error: {ex.Message}");
                }
            }

            if (updated > 0)
            {
                await context.SaveChangesAsync();
                Console.WriteLine($"[SubTitle Seeder] Saved {updated} updates to database.");
            }

            Console.WriteLine($"[SubTitle Seeder] Done. Updated: {updated}, Skipped: {skipped}, Errors: {errors}, Not Found: {notFound}");
        }

        private static async Task SeedConsumableItemSubtitlesAsync(ApplicationDbContext context, List<JsonElement> items)
        {
            Console.WriteLine($"[SubTitle Seeder] Starting to update subtitles for {items.Count} items...");

            int updated = 0;
            int skipped = 0;
            int errors = 0;
            int notFound = 0;
            var usedItemIds = new HashSet<int>();

            foreach (var item in items)
            {
                try
                {
                    if (!item.TryGetProperty("Title", out var titleProp) || titleProp.ValueKind != JsonValueKind.String || string.IsNullOrWhiteSpace(titleProp.GetString()))
                    {
                        skipped++;
                        continue;
                    }

                    var name = titleProp.GetString();
                    string? subTitle = null;
                    
                    if (item.TryGetProperty("SubTitle", out var subTitleProp) && subTitleProp.ValueKind == JsonValueKind.String)
                    {
                        var val = subTitleProp.GetString();
                        if (!string.IsNullOrWhiteSpace(val))
                            subTitle = val;
                    }

                    if (string.IsNullOrWhiteSpace(subTitle))
                    {
                        skipped++;
                        continue;
                    }

                    // Use macronutrients to disambiguate duplicate titles
                    int calories = GetSafeInteger(item, "CaloriesPer100g");
                    double protein = GetSafeDouble(item, "ProteinPer100g");
                    double carbs = GetSafeDouble(item, "CarbohydratesPer100g");
                    double fat = GetSafeDouble(item, "FatsPer100g");

                    var potentialMatches = await context.ConsumableItems
                        .Where(c => c.Name == name)
                        .ToListAsync();

                    if (potentialMatches.Count == 0)
                    {
                        notFound++;
                        if (notFound <= 10)
                            Console.WriteLine($"[SubTitle Seeder] NOT FOUND in DB: {name}");
                        continue;
                    }

                    var candidates = potentialMatches
                        .Where(c => string.IsNullOrEmpty(c.SubTitle) && !usedItemIds.Contains(c.Id))
                        .ToList();

                    if (candidates.Count == 0)
                    {
                        skipped++;
                        continue;
                    }

                    var bestMatch = FindBestMatch(candidates, subTitle, calories, protein, carbs, fat);
                    if (bestMatch != null)
                    {
                        bestMatch.SubTitle = subTitle;
                        usedItemIds.Add(bestMatch.Id);
                        updated++;
                        if (updated <= 20)
                            Console.WriteLine($"[SubTitle Seeder] Updated: {name} | {subTitle}");
                    }
                    else
                    {
                        skipped++;
                    }
                }
                catch (Exception ex)
                {
                    errors++;
                    Console.WriteLine($"[SubTitle Seeder] Error: {ex.Message}");
                }
            }

            if (updated > 0)
            {
                await context.SaveChangesAsync();
                Console.WriteLine($"[SubTitle Seeder] Saved {updated} updates to database.");
            }

            Console.WriteLine($"[SubTitle Seeder] Done. Updated: {updated}, Skipped: {skipped}, Errors: {errors}, Not Found: {notFound}");
        }

        private static ConsumableItem? FindBestMatch(List<ConsumableItem> potentialMatches, string? subTitle, int calories, double protein, double carbs, double fat)
        {
            if (potentialMatches.Count == 0) return null;
            if (potentialMatches.Count == 1) return potentialMatches[0];

            var bestScore = -1;
            ConsumableItem? bestMatch = null;

            foreach (var match in potentialMatches)
            {
                var score = CalculateMatchScore(match, subTitle, calories, protein, carbs, fat);
                if (score > bestScore)
                {
                    bestScore = score;
                    bestMatch = match;
                }
            }

            return bestMatch;
        }

        private static int CalculateMatchScore(ConsumableItem dbItem, string? subTitle, int calories, double protein, double carbs, double fat)
        {
            var score = 0;

            // SubTitle match (highest priority)
            if (dbItem.SubTitle == subTitle) score += 100;
            else if (string.IsNullOrEmpty(dbItem.SubTitle) && string.IsNullOrEmpty(subTitle)) score += 50;
            else if (string.IsNullOrEmpty(dbItem.SubTitle) || string.IsNullOrEmpty(subTitle)) score += 25;

            // Macronutrient matches (tolerance for small differences)
            if (Math.Abs(dbItem.CaloriesPer100g - calories) <= 1) score += 20;
            else if (Math.Abs(dbItem.CaloriesPer100g - calories) <= 5) score += 10;

            if (Math.Abs(dbItem.ProteinPer100g - protein) <= 0.1) score += 20;
            else if (Math.Abs(dbItem.ProteinPer100g - protein) <= 0.5) score += 10;

            if (Math.Abs(dbItem.CarbohydratePer100g - carbs) <= 0.1) score += 20;
            else if (Math.Abs(dbItem.CarbohydratePer100g - carbs) <= 0.5) score += 10;

            if (Math.Abs(dbItem.FatPer100g - fat) <= 0.1) score += 20;
            else if (Math.Abs(dbItem.FatPer100g - fat) <= 0.5) score += 10;

            return score;
        }

        private static async Task<(ConsumableItem? Item, string MatchStrategy)> GuaranteedFindMatch(ApplicationDbContext context, string name, string? subTitle, int calories, double protein, double carbs, double fat)
        {
            // First try: exact match by name + subtitle + macronutrients
            var exactMatch = await context.ConsumableItems.FirstOrDefaultAsync(c => 
                c.Name == name && 
                c.SubTitle == subTitle &&
                c.CaloriesPer100g == calories &&
                c.ProteinPer100g == protein &&
                c.CarbohydratePer100g == carbs &&
                c.FatPer100g == fat);

            if (exactMatch != null) return (exactMatch, "exact");

            // Second try: match by name + subtitle (ignore macronutrients)
            var subtitleMatch = await context.ConsumableItems.FirstOrDefaultAsync(c => 
                c.Name == name && 
                c.SubTitle == subTitle);

            if (subtitleMatch != null) return (subtitleMatch, "subtitle");

            // Third try: match by name only (take the first one without MainCategory)
            var nameMatch = await context.ConsumableItems
                .Where(c => c.Name == name)
                .OrderBy(c => string.IsNullOrEmpty(c.MainCategory) ? 0 : 1) // Prioritize items without MainCategory
                .FirstOrDefaultAsync();

            if (nameMatch != null) return (nameMatch, "name-only");

            return (null, "none");
        }

        private static async Task AnalyzeMainCategoryStatus(ApplicationDbContext context, List<JsonElement> jsonItems)
        {
            Console.WriteLine($"[MainCategory Seeder] === ANALYSIS ===");
            
            // Count JSON items with MainCategory
            int jsonItemsWithMainCategory = 0;
            var jsonMainCategories = new HashSet<string>();
            
            foreach (var item in jsonItems)
            {
                if (item.TryGetProperty("MainCategory", out var mainCatProp) && 
                    mainCatProp.ValueKind == JsonValueKind.String && 
                    !string.IsNullOrWhiteSpace(mainCatProp.GetString()))
                {
                    jsonItemsWithMainCategory++;
                    jsonMainCategories.Add(mainCatProp.GetString()!);
                }
            }
            
            Console.WriteLine($"[MainCategory Seeder] JSON Analysis:");
            Console.WriteLine($"[MainCategory Seeder]   Total JSON items: {jsonItems.Count}");
            Console.WriteLine($"[MainCategory Seeder]   JSON items with MainCategory: {jsonItemsWithMainCategory}");
            Console.WriteLine($"[MainCategory Seeder]   Unique MainCategories in JSON: {jsonMainCategories.Count}");
            
            // Show some sample MainCategories from JSON
            Console.WriteLine($"[MainCategory Seeder]   Sample MainCategories: {string.Join(", ", jsonMainCategories.Take(10))}");
            
            // Database analysis
            var totalDbItems = await context.ConsumableItems.CountAsync();
            var dbItemsWithMainCategory = await context.ConsumableItems.CountAsync(c => !string.IsNullOrEmpty(c.MainCategory));
            var dbItemsWithoutMainCategory = await context.ConsumableItems.CountAsync(c => string.IsNullOrEmpty(c.MainCategory));
            
            Console.WriteLine($"[MainCategory Seeder] Database Analysis:");
            Console.WriteLine($"[MainCategory Seeder]   Total DB items: {totalDbItems}");
            Console.WriteLine($"[MainCategory Seeder]   DB items with MainCategory: {dbItemsWithMainCategory}");
            Console.WriteLine($"[MainCategory Seeder]   DB items without MainCategory: {dbItemsWithoutMainCategory}");
            
            // Show MainCategories in database
            var dbMainCategories = await context.ConsumableItems
                .Where(c => !string.IsNullOrEmpty(c.MainCategory))
                .Select(c => c.MainCategory)
                .Distinct()
                .ToListAsync();
            
            Console.WriteLine($"[MainCategory Seeder]   Unique MainCategories in DB: {dbMainCategories.Count}");
            Console.WriteLine($"[MainCategory Seeder]   Sample DB MainCategories: {string.Join(", ", dbMainCategories.Take(10))}");
            
            Console.WriteLine($"[MainCategory Seeder] === END ANALYSIS ===");
        }

        private static async Task<bool> ShouldSkipSeeding(ApplicationDbContext context, List<JsonElement> jsonItems, string operationType = "MainCategory")
        {
            Console.WriteLine($"[Hash Check] Checking if {operationType} seeding is needed...");
            
            try
            {
                // Get the stored database hash from the database
                var storedDbHash = await GetStoredHash(context, operationType);
                
                if (string.IsNullOrEmpty(storedDbHash))
                {
                    Console.WriteLine($"[Hash Check] No stored database hash found for {operationType} - seeding needed");
                    return false;
                }

                // Calculate current database hash
                var currentDbHash = await CalculateDatabaseHash(context);
                Console.WriteLine($"[Hash Check] Current database hash: {currentDbHash}");
                Console.WriteLine($"[Hash Check] Stored {operationType} hash: {storedDbHash}");
                
                // Compare database hashes - if they match, no changes were made, so skip seeding
                if (currentDbHash == storedDbHash)
                {
                    Console.WriteLine($"[Hash Check] Database hashes match - no changes detected, skipping {operationType} seeding");
                    return true;
                }
                
                Console.WriteLine($"[Hash Check] Database hashes differ - changes detected, {operationType} seeding needed");
                return false;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Hash Check] Error during {operationType} hash check: {ex.Message}");
                return false; // If hash check fails, proceed with seeding
            }
        }

        private static async Task<bool> ShouldSkipAllSeeding(ApplicationDbContext context, List<JsonElement> jsonItems)
        {
            Console.WriteLine($"[Master Hash Check] Checking if any seeding operations are needed...");
            
            try
            {
                // Check if we have stored hashes for both operations
                var storedSubTitleHash = await GetStoredHash(context, "SubTitle");
                var storedMainCategoryHash = await GetStoredHash(context, "MainCategory");
                
                if (string.IsNullOrEmpty(storedSubTitleHash) && string.IsNullOrEmpty(storedMainCategoryHash))
                {
                    Console.WriteLine($"[Master Hash Check] No stored hashes found - seeding operations needed");
                    return false;
                }

                // Calculate current database hash once for efficiency
                var currentDbHash = await CalculateDatabaseHash(context);
                Console.WriteLine($"[Master Hash Check] Current database hash: {currentDbHash}");
                
                // Check if both operations can be skipped
                bool skipSubTitle = !string.IsNullOrEmpty(storedSubTitleHash) && currentDbHash == storedSubTitleHash;
                bool skipMainCategory = !string.IsNullOrEmpty(storedMainCategoryHash) && currentDbHash == storedMainCategoryHash;
                
                if (skipSubTitle && skipMainCategory)
                {
                    Console.WriteLine($"[Master Hash Check] All seeding operations can be skipped - no changes detected");
                    return true;
                }
                
                Console.WriteLine($"[Master Hash Check] Some seeding operations needed - proceeding with individual checks");
                return false;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Master Hash Check] Error during master hash check: {ex.Message}");
                return false; // If hash check fails, proceed with seeding
            }
        }

        private static async Task<string> GetStoredHash(ApplicationDbContext context, string operationType = "MainCategory")
        {
            // Store the database hash in a special consumable item
            // In a production system, you might want a dedicated table for this
            try
            {
                // Check if we have any items with a special marker
                var hashItem = await context.ConsumableItems
                    .Where(c => c.Name == "__DATABASE_HASH__" && c.SubTitle == $"__{operationType.ToUpper()}_SEEDER__")
                    .FirstOrDefaultAsync();
                
                return hashItem?.MainCategory ?? string.Empty;
            }
            catch
            {
                return string.Empty;
            }
        }

        private static async Task StoreHash(ApplicationDbContext context, string hash, string operationType = "MainCategory")
        {
            try
            {
                // Store the database hash in a special consumable item
                var hashItem = await context.ConsumableItems
                    .Where(c => c.Name == "__DATABASE_HASH__" && c.SubTitle == $"__{operationType.ToUpper()}_SEEDER__")
                    .FirstOrDefaultAsync();
                
                if (hashItem == null)
                {
                    // Create the hash storage item
                    hashItem = new ConsumableItem
                    {
                        Name = "__DATABASE_HASH__",
                        SubTitle = $"__{operationType.ToUpper()}_SEEDER__",
                        MainCategory = hash,
                        CaloriesPer100g = 0,
                        ProteinPer100g = 0,
                        CarbohydratePer100g = 0,
                        FatPer100g = 0,
                        Type = TypeOfConsumable.Food,
                        IsPublic = false,
                        UserId = null
                    };
                    context.ConsumableItems.Add(hashItem);
                }
                else
                {
                    hashItem.MainCategory = hash;
                }
                
                await context.SaveChangesAsync();
                Console.WriteLine($"[Hash Check] Stored new {operationType} database hash: {hash}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Hash Check] Error storing {operationType} database hash: {ex.Message}");
            }
        }

        private static async Task<string> CalculateDatabaseHash(ApplicationDbContext context)
        {
            // Get all consumable items with their key properties
            var items = await context.ConsumableItems
                .Where(c => c.Name != "__DATABASE_HASH__") // Exclude our hash storage item
                .Select(c => new
                {
                    c.Name,
                    c.SubTitle,
                    c.MainCategory,
                    c.CaloriesPer100g,
                    c.ProteinPer100g,
                    c.CarbohydratePer100g,
                    c.FatPer100g
                })
                .OrderBy(c => c.Name)
                .ThenBy(c => c.SubTitle)
                .ToListAsync();

            // Create a string representation for hashing
            var dbContent = string.Join("|", items.Select(i => 
                $"{i.Name}|{i.SubTitle ?? ""}|{i.MainCategory ?? ""}|{i.CaloriesPer100g}|{i.ProteinPer100g}|{i.CarbohydratePer100g}|{i.FatPer100g}"));

            // Calculate SHA256 hash
            using var sha256 = System.Security.Cryptography.SHA256.Create();
            var bytes = System.Text.Encoding.UTF8.GetBytes(dbContent);
            var hashBytes = sha256.ComputeHash(bytes);
            return Convert.ToBase64String(hashBytes);
        }

        private static string GetSafeIntegerString(JsonElement item, string propertyName)
        {
            if (!item.TryGetProperty(propertyName, out var prop) || prop.ValueKind != JsonValueKind.Number)
                return "0";
            
            try
            {
                // Try to get as integer first
                return prop.GetInt32().ToString();
            }
            catch (FormatException)
            {
                try
                {
                    // If it fails, try as double and convert to int
                    return ((int)prop.GetDouble()).ToString();
                }
                catch
                {
                    return "0";
                }
            }
        }

        private static string GetSafeDoubleString(JsonElement item, string propertyName)
        {
            if (!item.TryGetProperty(propertyName, out var prop) || prop.ValueKind != JsonValueKind.Number)
                return "0";
            
            try
            {
                return prop.GetDouble().ToString();
            }
            catch
            {
                return "0";
            }
        }

        private static int GetSafeInteger(JsonElement item, string propertyName)
        {
            if (!item.TryGetProperty(propertyName, out var prop) || prop.ValueKind != JsonValueKind.Number)
                return 0;
            
            try
            {
                // Try to get as integer first
                return prop.GetInt32();
            }
            catch (FormatException)
            {
                try
                {
                    // If it fails, try as double and convert to int
                    return (int)prop.GetDouble();
                }
                catch
                {
                    return 0;
                }
            }
        }

        private static double GetSafeDouble(JsonElement item, string propertyName)
        {
            if (!item.TryGetProperty(propertyName, out var prop) || prop.ValueKind != JsonValueKind.Number)
                return 0;
            
            try
            {
                return prop.GetDouble();
            }
            catch
            {
                return 0;
            }
        }

        private static string CalculateJsonHash(List<JsonElement> jsonItems)
        {
            // Create a string representation of JSON items for hashing
            var jsonContent = string.Join("|", jsonItems.Select(item =>
            {
                var name = item.TryGetProperty("Title", out var titleProp) && titleProp.ValueKind == JsonValueKind.String ? titleProp.GetString() ?? "" : "";
                var subTitle = item.TryGetProperty("SubTitle", out var subTitleProp) && subTitleProp.ValueKind == JsonValueKind.String ? subTitleProp.GetString() ?? "" : "";
                var mainCategory = item.TryGetProperty("MainCategory", out var mainCatProp) && mainCatProp.ValueKind == JsonValueKind.String ? mainCatProp.GetString() ?? "" : "";
                var calories = GetSafeIntegerString(item, "CaloriesPer100g");
                var protein = GetSafeDoubleString(item, "ProteinPer100g");
                var carbs = GetSafeDoubleString(item, "CarbohydratesPer100g");
                var fat = GetSafeDoubleString(item, "FatsPer100g");
                
                return $"{name}|{subTitle}|{mainCategory}|{calories}|{protein}|{carbs}|{fat}";
            }).OrderBy(s => s));

            // Calculate SHA256 hash
            using var sha256 = System.Security.Cryptography.SHA256.Create();
            var bytes = System.Text.Encoding.UTF8.GetBytes(jsonContent);
            var hashBytes = sha256.ComputeHash(bytes);
            return Convert.ToBase64String(hashBytes);
        }

        public static async Task SeedAllConsumableItemUpdatesAsync(IServiceProvider serviceProvider)
        {
            Console.OutputEncoding = System.Text.Encoding.UTF8;
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var filePath = "consumableItem.json";
            Console.WriteLine($"[Unified Seeder] Looking for file at: {filePath}");
            
            if (!File.Exists(filePath))
            {
                Console.WriteLine($"[Unified Seeder] File not found: {filePath}");
                return;
            }

            using var stream = File.OpenRead(filePath);
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var items = await JsonSerializer.DeserializeAsync<List<JsonElement>>(stream, options);
            
            if (items == null)
            {
                Console.WriteLine("[Unified Seeder] No items found in JSON file.");
                return;
            }

            // Master hash check - determine what seeding operations are needed
            if (await ShouldSkipAllSeeding(context, items))
            {
                Console.WriteLine($"[Unified Seeder] All seeding operations can be skipped - no changes detected");
                return;
            }

            // Check and run SubTitle seeder if needed
            if (!await ShouldSkipSeeding(context, items, "SubTitle"))
            {
                Console.WriteLine($"[Unified Seeder] Running SubTitle seeder...");
                await SeedConsumableItemSubtitlesAsync(context, items);
            }
            else
            {
                Console.WriteLine($"[Unified Seeder] Skipping SubTitle seeder - no changes detected");
            }
            
            // Check and run MainCategory seeder if needed
            if (!await ShouldSkipSeeding(context, items, "MainCategory"))
            {
                Console.WriteLine($"[Unified Seeder] Running MainCategory seeder...");
                await SeedConsumableItemMainCategoriesAsync(context, items);
            }
            else
            {
                Console.WriteLine($"[Unified Seeder] Skipping MainCategory seeder - no changes detected");
            }
        }

        private static async Task SeedConsumableItemMainCategoriesAsync(ApplicationDbContext context, List<JsonElement> items)
        {
            // Analyze the current state
            await AnalyzeMainCategoryStatus(context, items);

            // Get current database state for comparison
            var totalItemsInDb = await context.ConsumableItems.CountAsync();
            var itemsWithMainCategory = await context.ConsumableItems.CountAsync(c => !string.IsNullOrEmpty(c.MainCategory));
            var itemsWithoutMainCategory = await context.ConsumableItems.CountAsync(c => string.IsNullOrEmpty(c.MainCategory));

            int updated = 0;
            int skipped = 0;
            int errors = 0;
            int notFound = 0;
            int skippedNoMainCategory = 0;
            Console.WriteLine($"[MainCategory Seeder] Starting to update main categories for {items.Count} items...");

            foreach (var item in items)
            {
                string? name = null;
                try
                {
                    if (!item.TryGetProperty("Title", out var titleProp) || titleProp.ValueKind != JsonValueKind.String || string.IsNullOrWhiteSpace(titleProp.GetString()))
                    {
                        skipped++;
                        continue;
                    }

                    name = titleProp.GetString();
                    string? subTitle = null;
                    string? mainCategory = null;
                    
                    // Get SubTitle
                    if (item.TryGetProperty("SubTitle", out var subTitleProp) && subTitleProp.ValueKind == JsonValueKind.String)
                    {
                        var val = subTitleProp.GetString();
                        if (!string.IsNullOrWhiteSpace(val))
                            subTitle = val;
                    }

                    // Get MainCategory
                    if (item.TryGetProperty("MainCategory", out var mainCategoryProp) && mainCategoryProp.ValueKind == JsonValueKind.String)
                    {
                        var val = mainCategoryProp.GetString();
                        if (!string.IsNullOrWhiteSpace(val))
                            mainCategory = val;
                    }

                    if (string.IsNullOrWhiteSpace(mainCategory))
                    {
                        skippedNoMainCategory++;
                        continue;
                    }

                    // Get macronutrients for precise matching
                    int calories = GetSafeInteger(item, "CaloriesPer100g");
                    double protein = GetSafeDouble(item, "ProteinPer100g");
                    double carbs = GetSafeDouble(item, "CarbohydratesPer100g");
                    double fat = GetSafeDouble(item, "FatsPer100g");

                    // Use guaranteed matching to find the best database row for this JSON item
                    var (existingItem, matchStrategy) = await GuaranteedFindMatch(context, name, subTitle, calories, protein, carbs, fat);

                    if (existingItem == null)
                    {
                        notFound++;
                        if (notFound <= 10) // Only show first 10 not found items to avoid spam
                        {
                            Console.WriteLine($"[MainCategory Seeder] NOT FOUND: {name} | {subTitle}");
                        }
                        continue;
                    }

                    // Always update with the MainCategory from JSON (this handles both new and existing values)
                    var oldMainCategory = existingItem.MainCategory;
                    existingItem.MainCategory = mainCategory;
                    
                    if (string.IsNullOrEmpty(oldMainCategory))
                    {
                        updated++;
                        Console.WriteLine($"[MainCategory Seeder] Updated ({matchStrategy}): {name} | {subTitle} | {mainCategory}");
                    }
                    else if (oldMainCategory != mainCategory)
                    {
                        updated++;
                        Console.WriteLine($"[MainCategory Seeder] Updated ({matchStrategy}): {name} | {subTitle} | '{oldMainCategory}' -> '{mainCategory}'");
                    }
                    else
                    {
                        skipped++;
                        Console.WriteLine($"[MainCategory Seeder] Skipped (same main category): {name} | {subTitle} | {mainCategory}");
                    }
                }
                catch (Exception ex)
                {
                    errors++;
                    Console.WriteLine($"[MainCategory Seeder] Error processing {name}: {ex.Message}");
                }
            }

            if (updated > 0)
            {
                await context.SaveChangesAsync();
                Console.WriteLine($"[MainCategory Seeder] Saved {updated} updates to database.");
            }

            // Show final statistics
            var finalItemsWithMainCategory = await context.ConsumableItems.CountAsync(c => !string.IsNullOrEmpty(c.MainCategory));
            var finalItemsWithoutMainCategory = await context.ConsumableItems.CountAsync(c => string.IsNullOrEmpty(c.MainCategory));
            
            Console.WriteLine($"[MainCategory Seeder] Final Database Status:");
            Console.WriteLine($"[MainCategory Seeder] Items with MainCategory: {finalItemsWithMainCategory} (was: {itemsWithMainCategory})");
            Console.WriteLine($"[MainCategory Seeder] Items without MainCategory: {finalItemsWithoutMainCategory} (was: {itemsWithoutMainCategory})");
            
            Console.WriteLine($"[MainCategory Seeder] Done. Updated: {updated}, Skipped: {skipped}, Skipped (no MainCategory in JSON): {skippedNoMainCategory}, Errors: {errors}, Not Found: {notFound}");

            // Now handle orphaned database items (items in DB that don't match any JSON items)
            Console.WriteLine($"\n[MainCategory Seeder] === HANDLING ORPHANED DATABASE ITEMS ===");
            await HandleOrphanedDatabaseItems(context, items);

            // Store the final database hash for future comparisons
            var finalDbHash = await CalculateDatabaseHash(context);
            await StoreHash(context, finalDbHash, "MainCategory");
            Console.WriteLine($"[Hash Check] Stored final MainCategory database hash for future comparisons");
        }

        public static async Task SeedConsumableItemMainCategoriesAsync(IServiceProvider serviceProvider)
        {
            Console.OutputEncoding = System.Text.Encoding.UTF8;
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var filePath = "consumableItem.json";
            Console.WriteLine($"[MainCategory Seeder] Looking for file at: {filePath}");
            
            if (!File.Exists(filePath))
            {
                Console.WriteLine($"[MainCategory Seeder] File not found: {filePath}");
                return;
            }

            using var stream = File.OpenRead(filePath);
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var items = await JsonSerializer.DeserializeAsync<List<JsonElement>>(stream, options);
            
            if (items == null)
            {
                Console.WriteLine("[MainCategory Seeder] No items found in JSON file.");
                return;
            }

            // Check if seeding is needed using hash comparison
            if (await ShouldSkipSeeding(context, items, "MainCategory"))
            {
                Console.WriteLine($"[MainCategory Seeder] Skipping seeding - no changes detected");
                return;
            }

            // Analyze the current state
            await AnalyzeMainCategoryStatus(context, items);

            // Get current database state for comparison
            var totalItemsInDb = await context.ConsumableItems.CountAsync();
            var itemsWithMainCategory = await context.ConsumableItems.CountAsync(c => !string.IsNullOrEmpty(c.MainCategory));
            var itemsWithoutMainCategory = await context.ConsumableItems.CountAsync(c => string.IsNullOrEmpty(c.MainCategory));

            int updated = 0;
            int skipped = 0;
            int errors = 0;
            int notFound = 0;
            int skippedNoMainCategory = 0;
            Console.WriteLine($"[MainCategory Seeder] Starting to update main categories for {items.Count} items...");

            foreach (var item in items)
            {
                string? name = null;
                try
                {
                    if (!item.TryGetProperty("Title", out var titleProp) || titleProp.ValueKind != JsonValueKind.String || string.IsNullOrWhiteSpace(titleProp.GetString()))
                    {
                        skipped++;
                        continue;
                    }

                    name = titleProp.GetString();
                    string? subTitle = null;
                    string? mainCategory = null;
                    
                    // Get SubTitle
                    if (item.TryGetProperty("SubTitle", out var subTitleProp) && subTitleProp.ValueKind == JsonValueKind.String)
                    {
                        var val = subTitleProp.GetString();
                        if (!string.IsNullOrWhiteSpace(val))
                            subTitle = val;
                    }

                    // Get MainCategory
                    if (item.TryGetProperty("MainCategory", out var mainCategoryProp) && mainCategoryProp.ValueKind == JsonValueKind.String)
                    {
                        var val = mainCategoryProp.GetString();
                        if (!string.IsNullOrWhiteSpace(val))
                            mainCategory = val;
                    }

                    if (string.IsNullOrWhiteSpace(mainCategory))
                    {
                        skippedNoMainCategory++;
                        continue;
                    }

                    // Get macronutrients for precise matching
                    int calories = GetSafeInteger(item, "CaloriesPer100g");
                    double protein = GetSafeDouble(item, "ProteinPer100g");
                    double carbs = GetSafeDouble(item, "CarbohydratesPer100g");
                    double fat = GetSafeDouble(item, "FatsPer100g");

                    // Use guaranteed matching to find the best database row for this JSON item
                    var (existingItem, matchStrategy) = await GuaranteedFindMatch(context, name, subTitle, calories, protein, carbs, fat);

                    if (existingItem == null)
                    {
                        notFound++;
                        if (notFound <= 10) // Only show first 10 not found items to avoid spam
                        {
                            Console.WriteLine($"[MainCategory Seeder] NOT FOUND: {name} | {subTitle}");
                        }
                        continue;
                    }

                    // Always update with the MainCategory from JSON (this handles both new and existing values)
                    var oldMainCategory = existingItem.MainCategory;
                    existingItem.MainCategory = mainCategory;
                    
                    if (string.IsNullOrEmpty(oldMainCategory))
                    {
                        updated++;
                        Console.WriteLine($"[MainCategory Seeder] Updated ({matchStrategy}): {name} | {subTitle} | {mainCategory}");
                    }
                    else if (oldMainCategory != mainCategory)
                    {
                        updated++;
                        Console.WriteLine($"[MainCategory Seeder] Updated ({matchStrategy}): {name} | {subTitle} | '{oldMainCategory}' -> '{mainCategory}'");
                    }
                    else
                    {
                        skipped++;
                        Console.WriteLine($"[MainCategory Seeder] Skipped (same main category): {name} | {subTitle} | {mainCategory}");
                    }
                }
                catch (Exception ex)
                {
                    errors++;
                    Console.WriteLine($"[MainCategory Seeder] Error processing {name}: {ex.Message}");
                }
            }

            if (updated > 0)
            {
                await context.SaveChangesAsync();
                Console.WriteLine($"[MainCategory Seeder] Saved {updated} updates to database.");
            }

            // Show final statistics
            var finalItemsWithMainCategory = await context.ConsumableItems.CountAsync(c => !string.IsNullOrEmpty(c.MainCategory));
            var finalItemsWithoutMainCategory = await context.ConsumableItems.CountAsync(c => string.IsNullOrEmpty(c.MainCategory));
            
            Console.WriteLine($"[MainCategory Seeder] Final Database Status:");
            Console.WriteLine($"[MainCategory Seeder] Items with MainCategory: {finalItemsWithMainCategory} (was: {itemsWithMainCategory})");
            Console.WriteLine($"[MainCategory Seeder] Items without MainCategory: {finalItemsWithoutMainCategory} (was: {itemsWithoutMainCategory})");
            
            Console.WriteLine($"[MainCategory Seeder] Done. Updated: {updated}, Skipped: {skipped}, Skipped (no MainCategory in JSON): {skippedNoMainCategory}, Errors: {errors}, Not Found: {notFound}");

            // Now handle orphaned database items (items in DB that don't match any JSON items)
            Console.WriteLine($"\n[MainCategory Seeder] === HANDLING ORPHANED DATABASE ITEMS ===");
            await HandleOrphanedDatabaseItems(context, items);

            // Store the final database hash for future comparisons
            var finalDbHash = await CalculateDatabaseHash(context);
            await StoreHash(context, finalDbHash, "MainCategory");
            Console.WriteLine($"[Hash Check] Stored final MainCategory database hash for future comparisons");
        }

        private static async Task HandleOrphanedDatabaseItems(ApplicationDbContext context, List<JsonElement> jsonItems)
        {
            Console.WriteLine($"[Orphaned Handler] Checking for database items without MainCategory that don't match JSON items...");
            
            // Get all database items without MainCategory
            var dbItemsWithoutMainCategory = await context.ConsumableItems
                .Where(c => string.IsNullOrEmpty(c.MainCategory))
                .ToListAsync();

            Console.WriteLine($"[Orphaned Handler] Found {dbItemsWithoutMainCategory.Count} database items without MainCategory");

            if (dbItemsWithoutMainCategory.Count == 0)
            {
                Console.WriteLine($"[Orphaned Handler] No orphaned items to handle.");
                return;
            }

            // Create a lookup of JSON items for faster matching
            var jsonLookup = new Dictionary<string, List<JsonElement>>();
            foreach (var jsonItem in jsonItems)
            {
                if (jsonItem.TryGetProperty("Title", out var titleProp) && 
                    titleProp.ValueKind == JsonValueKind.String && 
                    !string.IsNullOrWhiteSpace(titleProp.GetString()))
                {
                    var title = titleProp.GetString()!;
                    if (!jsonLookup.ContainsKey(title))
                        jsonLookup[title] = new List<JsonElement>();
                    jsonLookup[title].Add(jsonItem);
                }
            }

            int orphanedUpdated = 0;
            int orphanedSkipped = 0;
            
            foreach (var dbItem in dbItemsWithoutMainCategory)
            {
                try
                {
                    // Try to find a matching JSON item for this database item
                    if (jsonLookup.TryGetValue(dbItem.Name, out var potentialJsonMatches))
                    {
                        // Find the best matching JSON item using reverse matching
                        var bestJsonMatch = FindBestJsonMatch(dbItem, potentialJsonMatches);
                        
                        if (bestJsonMatch != null && 
                            bestJsonMatch.Value.TryGetProperty("MainCategory", out var mainCatProp) &&
                            mainCatProp.ValueKind == JsonValueKind.String &&
                            !string.IsNullOrWhiteSpace(mainCatProp.GetString()))
                        {
                            dbItem.MainCategory = mainCatProp.GetString();
                            orphanedUpdated++;
                            Console.WriteLine($"[Orphaned Handler] Updated orphaned item: {dbItem.Name} | {dbItem.SubTitle} | {dbItem.MainCategory}");
                        }
                        else
                        {
                            orphanedSkipped++;
                        }
                    }
                    else
                    {
                        orphanedSkipped++;
                        if (orphanedSkipped <= 20) // Show first 20 orphaned items
                        {
                            Console.WriteLine($"[Orphaned Handler] No JSON match for: {dbItem.Name} | {dbItem.SubTitle}");
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[Orphaned Handler] Error processing {dbItem.Name}: {ex.Message}");
                }
            }

            if (orphanedUpdated > 0)
            {
                await context.SaveChangesAsync();
                Console.WriteLine($"[Orphaned Handler] Saved {orphanedUpdated} orphaned item updates to database.");
            }

            // Final status
            var finalDbItemsWithoutMainCategory = await context.ConsumableItems.CountAsync(c => string.IsNullOrEmpty(c.MainCategory));
            Console.WriteLine($"[Orphaned Handler] Done. Updated: {orphanedUpdated}, Skipped: {orphanedSkipped}");
            Console.WriteLine($"[Orphaned Handler] Remaining items without MainCategory: {finalDbItemsWithoutMainCategory}");
        }

        private static JsonElement? FindBestJsonMatch(ConsumableItem dbItem, List<JsonElement> jsonCandidates)
        {
            JsonElement? bestMatch = null;
            var bestScore = -1;

            foreach (var jsonItem in jsonCandidates)
            {
                var score = 0;

                // Check SubTitle match
                if (jsonItem.TryGetProperty("SubTitle", out var subTitleProp) && subTitleProp.ValueKind == JsonValueKind.String)
                {
                    var jsonSubTitle = subTitleProp.GetString();
                    if (dbItem.SubTitle == jsonSubTitle) score += 100;
                    else if (string.IsNullOrEmpty(dbItem.SubTitle) && string.IsNullOrEmpty(jsonSubTitle)) score += 50;
                }
                else if (string.IsNullOrEmpty(dbItem.SubTitle))
                {
                    score += 50; // Both have no subtitle
                }

                // Check macronutrients
                var jsonCalories = GetSafeInteger(jsonItem, "CaloriesPer100g");
                if (Math.Abs(dbItem.CaloriesPer100g - jsonCalories) <= 1) score += 20;
                else if (Math.Abs(dbItem.CaloriesPer100g - jsonCalories) <= 5) score += 10;

                var jsonProtein = GetSafeDouble(jsonItem, "ProteinPer100g");
                if (Math.Abs(dbItem.ProteinPer100g - jsonProtein) <= 0.1) score += 20;
                else if (Math.Abs(dbItem.ProteinPer100g - jsonProtein) <= 0.5) score += 10;

                if (score > bestScore)
                {
                    bestScore = score;
                    bestMatch = jsonItem;
                }
            }

            return bestMatch;
        }
    }
}
