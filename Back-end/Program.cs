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
                        Console.WriteLine($"Auth Header: {authHeader ?? "null"}");
                        
                        var token = authHeader?.Split(" ").Last();
                        Console.WriteLine($"Token from header: {(token != null ? "present" : "null")}");

                        // If not found in header, check cookie
                        if (string.IsNullOrEmpty(token))
                        {
                            token = context.Request.Cookies["jwt"];
                            Console.WriteLine($"Token from cookie: {(token != null ? "present" : "null")}");
                        }

                        context.Token = token;
                        return Task.CompletedTask;
                    },
                    OnAuthenticationFailed = context =>
                    {
                        Console.WriteLine($"Authentication failed: {context.Exception.Message}");
                        return Task.CompletedTask;
                    },
                    OnTokenValidated = context =>
                    {
                        Console.WriteLine("Token was successfully validated");
                        return Task.CompletedTask;
                    },
                    OnChallenge = context =>
                    {
                        Console.WriteLine($"Authentication challenge issued: {context.Error}, {context.ErrorDescription}");
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

            builder.Logging.AddConsole();

            var app = builder.Build();

            using (var scope = app.Services.CreateScope())
            {
                var services = scope.ServiceProvider;
                DataSeeder.SeedActivityLevels(services).Wait();
                DataSeeder.SeedAdministratorAsync(services).Wait();
                DataSeeder.SeedTestUserAsync(services).Wait();
                DataSeeder.SeedTestActivities(services).Wait();
            }

            /*app.UseHttpsRedirection();*/

            app.UseCors("AllowReactApp");

            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}
