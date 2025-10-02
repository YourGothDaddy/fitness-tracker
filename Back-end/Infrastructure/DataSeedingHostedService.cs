namespace Fitness_Tracker.Infrastructure
{
    using Fitness_Tracker.Data;
    using Microsoft.EntityFrameworkCore;

    public class DataSeedingHostedService : IHostedService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<DataSeedingHostedService> _logger;

        public DataSeedingHostedService(IServiceProvider serviceProvider, ILogger<DataSeedingHostedService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        public async Task StartAsync(CancellationToken cancellationToken)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var services = scope.ServiceProvider;
                var dbContext = services.GetRequiredService<ApplicationDbContext>();

                await dbContext.Database.MigrateAsync(cancellationToken);

                await DataSeeder.SeedActivityLevels(services);
                await DataSeeder.SeedAdministratorAsync(services);
                await DataSeeder.SeedTestUserAsync(services);
                await DataSeeder.SeedActivityTypesAsync(services);
                await DataSeeder.SeedNutrientsAsync(services);
                await DataSeeder.SeedConsumableItemsAsync(services);
                await DataSeeder.SeedAllConsumableItemUpdatesAsync(services);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during data migration and seeding");
            }
        }

        public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
    }
}


