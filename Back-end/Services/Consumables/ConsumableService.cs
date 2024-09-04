namespace Fitness_Tracker.Services.Consumables
{
    using Fitness_Tracker.Data;
    using Microsoft.EntityFrameworkCore;

    public class ConsumableService : IConsumableService
    {
        private readonly ApplicationDbContext _databaseContext;


        public ConsumableService(ApplicationDbContext _databaseContext)
        {
            this._databaseContext = _databaseContext;
        }

        public async Task<List<string>> GetMatchingConsumableItemsAsync(string query)
        {
            var result = await this._databaseContext
                .ConsumableItems
                .Where(ci => ci.Name.Contains(query))
                .Select(ci => ci.Name)
                .ToListAsync();

            return result;
        }
    }
}
