namespace Fitness_Tracker.Services.Consumables
{
    using Fitness_Tracker.Data;
    using Microsoft.EntityFrameworkCore;
    using Fitness_Tracker.Models.Admins;
    using Fitness_Tracker.Data.Models.Consumables;

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

        public async Task<List<ConsumableItem>> GetAllPublicConsumableItemsAsync()
        {
            return await this._databaseContext.ConsumableItems
                .Where(ci => ci.IsPublic)
                .ToListAsync();
        }

        public async Task AddConsumableItemAsync(AddConsumableItemModel model)
        {
            var newConsumableItem = new ConsumableItem
            {
                Name = model.Name,
                CaloriesPer100g = model.CaloriesPer100g,
                ProteinPer100g = model.ProteinPer100g,
                CarbohydratePer100g = model.CarbohydratePer100g,
                FatPer100g = model.FatPer100g,
                Type = model.Type,
                NutritionalInformation = model.NutritionalInformation ?? new List<Nutrient>(),
                IsPublic = true // For now, always public
            };
            await _databaseContext.ConsumableItems.AddAsync(newConsumableItem);
            await _databaseContext.SaveChangesAsync();
        }

        public async Task AddFavoriteConsumableItemAsync(string userId, int consumableItemId)
        {
            if (string.IsNullOrEmpty(userId))
                throw new ArgumentException("User ID cannot be null or empty", nameof(userId));
            var exists = await _databaseContext.UserFavoriteConsumableItems.AnyAsync(x => x.UserId == userId && x.ConsumableItemId == consumableItemId);
            if (!exists)
            {
                _databaseContext.UserFavoriteConsumableItems.Add(new Data.Models.UserFavoriteConsumableItem
                {
                    UserId = userId,
                    ConsumableItemId = consumableItemId
                });
                await _databaseContext.SaveChangesAsync();
            }
        }

        public async Task RemoveFavoriteConsumableItemAsync(string userId, int consumableItemId)
        {
            var entity = await _databaseContext.UserFavoriteConsumableItems.FirstOrDefaultAsync(x => x.UserId == userId && x.ConsumableItemId == consumableItemId);
            if (entity != null)
            {
                _databaseContext.UserFavoriteConsumableItems.Remove(entity);
                await _databaseContext.SaveChangesAsync();
            }
        }

        public async Task<bool> IsFavoriteConsumableItemAsync(string userId, int consumableItemId)
        {
            return await _databaseContext.UserFavoriteConsumableItems.AnyAsync(x => x.UserId == userId && x.ConsumableItemId == consumableItemId);
        }

        public async Task<List<Data.Models.Consumables.ConsumableItem>> GetFavoriteConsumableItemsAsync(string userId)
        {
            return await _databaseContext.UserFavoriteConsumableItems
                .Where(x => x.UserId == userId)
                .Select(x => x.ConsumableItem)
                .ToListAsync();
        }
    }
}
