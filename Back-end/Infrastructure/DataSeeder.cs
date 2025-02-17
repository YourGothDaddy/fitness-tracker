namespace Fitness_Tracker.Infrastructure
{
    using Fitness_Tracker.Data;
    using Fitness_Tracker.Data.Models;
    using Microsoft.AspNetCore.Identity;

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

    }

}
