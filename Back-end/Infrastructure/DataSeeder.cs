namespace Fitness_Tracker.Infrastructure
{
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
            if(!roleExists)
            {
                roleResult = await roleManager.CreateAsync(new IdentityRole(roleName));
            }

            var adminUser = new User
            {
                UserName = "admin@admin.com",
                Email = "admin@admin.com"
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
    }

}
