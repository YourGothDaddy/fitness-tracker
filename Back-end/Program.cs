namespace Fitness_Tracker
{
    using Fitness_Tracker.Data;
    using Fitness_Tracker.Data.Models;
    using Fitness_Tracker.Infrastructure;
    using Fitness_Tracker.Services.Activity;
    using Fitness_Tracker.Services.Admins;
    using Fitness_Tracker.Services.Consumables;
    using Fitness_Tracker.Services.Meals;
    using Fitness_Tracker.Services.Nutrition;
    using Fitness_Tracker.Services.Tokens;
    using Fitness_Tracker.Services.Users;
    using Fitness_Tracker.Services.Weight;
    using Microsoft.AspNetCore.Authentication.JwtBearer;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.DependencyInjection;
    using Microsoft.IdentityModel.Tokens;
    using System.Text;

    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

            builder.Services.AddIdentity<User, IdentityRole>()
                .AddEntityFrameworkStores<ApplicationDbContext>()
                .AddDefaultTokenProviders();

            builder.Services.AddTransient<IUserService, UserService>();
            builder.Services.AddTransient<IMealService, MealService>();
            builder.Services.AddTransient<IAdminService, AdminService>();
            builder.Services.AddTransient<IConsumableService, ConsumableService>();
            builder.Services.AddTransient<ITokenService, TokenService>();
            builder.Services.AddTransient<INutritionService, NutritionService>();
            builder.Services.AddTransient<IWeightService, WeightService>();
            builder.Services.AddTransient<IActivityService, ActivityService>();

            builder.Services.Configure<IdentityOptions>(options =>
            {
                //@dev Change the options later. Current options are only for developement purposes
                options.Password.RequireDigit = false;
                options.Password.RequireLowercase = false;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequireUppercase = false;
                options.Password.RequiredLength = 6;
                options.User.RequireUniqueEmail = true;
            });

            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = builder.Configuration["Jwt:Issuer"],
                    ValidAudience = builder.Configuration["Jwt:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
                };

                // Modified to check both header and cookie with logging
                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        // First check the Authorization header
                        var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();
                        
                        var token = authHeader?.Split(" ").Last();

                        // If not found in header, check cookie
                        if (string.IsNullOrEmpty(token))
                        {
                            token = context.Request.Cookies["jwt"];
                        }

                        context.Token = token;
                        return Task.CompletedTask;
                    },
                    OnAuthenticationFailed = context =>
                    {
                        return Task.CompletedTask;
                    },
                    OnTokenValidated = context =>
                    {
                        return Task.CompletedTask;
                    },
                    OnChallenge = context =>
                    {
                        return Task.CompletedTask;
                    }
                };
            });

            builder.Services.AddAuthorization(options =>
            {
                options.AddPolicy("RequireAdministratorRole", policy => policy.RequireRole("Administrator"));
            });

            builder.Services.AddControllers();

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowReactApp",
                    builder =>
                    {
                        builder.AllowAnyOrigin()
                            .AllowAnyHeader()
                            .AllowAnyMethod();
                    });
            });

            builder.WebHost.ConfigureKestrel(serverOptions =>
            {
                serverOptions.Listen(System.Net.IPAddress.Any, 7009);
            });

            var app = builder.Build();

            using (var scope = app.Services.CreateScope())
            {
                var services = scope.ServiceProvider;
                DataSeeder.SeedActivityLevels(services).Wait();
                DataSeeder.SeedAdministratorAsync(services).Wait();
                DataSeeder.SeedTestUserAsync(services).Wait();
                DataSeeder.SeedActivityTypesAsync(services).Wait();
                DataSeeder.SeedNutrientsAsync(services).Wait();
                DataSeeder.SeedConsumableItemsAsync(services).Wait();
                DataSeeder.SeedAllConsumableItemUpdatesAsync(services).Wait();
            }

            app.UseCors("AllowReactApp");

            app.UseStaticFiles(); // Enable serving static files (e.g., avatars)

            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}
