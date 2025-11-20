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
    using Fitness_Tracker.Services.Benchmarking;
    using Fitness_Tracker.Services.FileStorage;
    using Fitness_Tracker.Models;
    using Microsoft.AspNetCore.Authentication.JwtBearer;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.DependencyInjection;
    using Microsoft.IdentityModel.Tokens;
    using System.Text;
    using Fitness_Tracker.Services.Emails;

    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Choose database provider based on environment configuration
            var configuredConnString = builder.Configuration.GetConnectionString("DefaultConnection");
            var databaseUrl =
                Environment.GetEnvironmentVariable("DATABASE_URL") ??
                Environment.GetEnvironmentVariable("POSTGRES_URL") ??
                Environment.GetEnvironmentVariable("POSTGRESQL_URL");

            string finalConnectionString = !string.IsNullOrWhiteSpace(databaseUrl) ? databaseUrl : configuredConnString;
            bool usePostgres = false;

            if (!string.IsNullOrWhiteSpace(finalConnectionString))
            {
                var normalized = finalConnectionString.Trim();
                // Accept Render-style URI (postgres://...) and convert to Npgsql format
                if (normalized.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) ||
                    normalized.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
                {
                    finalConnectionString = ConvertPostgresUrlToNpgsql(normalized);
                    usePostgres = true;
                }
                else if (normalized.Contains("Host=", StringComparison.OrdinalIgnoreCase) ||
                         normalized.Contains("Username=", StringComparison.OrdinalIgnoreCase) ||
                         normalized.Contains("User ID=", StringComparison.OrdinalIgnoreCase))
                {
                    // Looks like Npgsql key-value format already
                    usePostgres = true;
                }
            }

            if (usePostgres)
            {
                builder.Services.AddDbContextPool<ApplicationDbContext>(options =>
                    options.UseNpgsql(
                        finalConnectionString,
                        sqlOptions =>
                        {
                            sqlOptions.EnableRetryOnFailure(
                                maxRetryCount: 15,
                                maxRetryDelay: TimeSpan.FromSeconds(30),
                                errorCodesToAdd: null);
                            sqlOptions.CommandTimeout(120);
                        }
                    )
                );
            }
            else
            {
                builder.Services.AddDbContextPool<ApplicationDbContext>(options =>
                    options.UseSqlServer(
                        finalConnectionString,
                        sqlOptions =>
                        {
                            sqlOptions.EnableRetryOnFailure(
                                maxRetryCount: 5,
                                maxRetryDelay: TimeSpan.FromSeconds(10),
                                errorNumbersToAdd: null);
                            sqlOptions.CommandTimeout(120);
                        }
                    )
                );
            }

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
            builder.Services.AddScoped<IBenchmarkService, BenchmarkService>();
            builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("EmailSettings"));
            builder.Services.AddTransient<IEmailService, EmailService>();
            builder.Services.AddTransient<IActivityService, ActivityService>();
            builder.Services.AddMemoryCache();

            // Configure Cloudinary for file storage
            builder.Services.Configure<CloudinarySettings>(builder.Configuration.GetSection("Cloudinary"));
            builder.Services.AddScoped<IFileStorageService, CloudinaryStorageService>();

            // Run data migrations and seeding in background so Kestrel can bind immediately
            builder.Services.AddHostedService<DataSeedingHostedService>();

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
            builder.Services.AddResponseCompression(options =>
            {
                options.EnableForHttps = true;
            });

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
                var portEnv = System.Environment.GetEnvironmentVariable("PORT");
                if (!string.IsNullOrWhiteSpace(portEnv) && int.TryParse(portEnv, out var renderPort))
                {
                    serverOptions.Listen(System.Net.IPAddress.Any, renderPort);
                }
                else
                {
                    // Fallback for local development
                    serverOptions.Listen(System.Net.IPAddress.Any, 7009);
                }
            });

            var app = builder.Build();

            app.UseCors("AllowReactApp");

            app.UseStaticFiles(); // Enable serving static files (e.g., avatars)
            app.UseResponseCompression();

            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }

        // Converts e.g. postgres://user:pass@host:5432/dbname?sslmode=require
        // to Npgsql key=value format that UseNpgsql accepts.
        private static string ConvertPostgresUrlToNpgsql(string url)
        {
            // Ensure scheme is parsable by System.Uri
            var uri = new Uri(url);
            var userInfo = uri.UserInfo?.Split(':', 2);
            var username = userInfo != null && userInfo.Length > 0 ? Uri.UnescapeDataString(userInfo[0]) : string.Empty;
            var password = userInfo != null && userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : string.Empty;
            var host = uri.Host;
            var port = uri.Port > 0 ? uri.Port : 5432;
            var database = uri.AbsolutePath.Trim('/'); // remove leading '/'

            // Parse query string manually (System.Web.HttpUtility not available in .NET 8)
            var sslMode = "Require";
            var trustServerCert = "true";
            if (!string.IsNullOrEmpty(uri.Query))
            {
                var queryParams = uri.Query.TrimStart('?').Split('&');
                foreach (var param in queryParams)
                {
                    var parts = param.Split('=', 2);
                    if (parts.Length == 2)
                    {
                        var key = parts[0].ToLowerInvariant();
                        var value = Uri.UnescapeDataString(parts[1]);
                        if (key == "sslmode")
                            sslMode = value;
                        else if (key == "trust server certificate" || key == "trustservercertificate")
                            trustServerCert = value;
                    }
                }
            }

            return $"Host={host};Port={port};Database={database};Username={username};Password={password};SSL Mode={sslMode};Trust Server Certificate={trustServerCert}";
        }
    }
}
