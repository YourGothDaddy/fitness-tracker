namespace Fitness_Tracker.Services.Admins
{
    using Fitness_Tracker.Data;
    using Fitness_Tracker.Data.Models.Consumables;
    using Fitness_Tracker.Models.Admins;
    using Microsoft.EntityFrameworkCore;
    using System.Threading.Tasks;

    public class AdminService : IAdminService
    {
        private readonly ApplicationDbContext _databaseContext;

        public AdminService(ApplicationDbContext databaseContext)
        {
            this._databaseContext = databaseContext;
        }

        public async Task CreateConsumableItemAsync(AddConsumableItemModel consumableItem)
        {
            var newConsumableItem = new ConsumableItem
            {
                Name = consumableItem.Name,
                CaloriesPer100g = consumableItem.CaloriesPer100g,
                ProteinPer100g = consumableItem.ProteinPer100g,
                CarbohydratePer100g = consumableItem.CarbohydratePer100g,
                FatPer100g = consumableItem.FatPer100g,
                Type = consumableItem.Type,
                NutritionalInformation = consumableItem.NutritionalInformation
            };


            await _databaseContext
                .ConsumableItems
                .AddAsync(newConsumableItem);

            await _databaseContext.SaveChangesAsync();
        }
        public async Task<bool> ConsumableItemExistsAsync(AddConsumableItemModel consumableItem)
        {
            return await _databaseContext
                .ConsumableItems
                .AnyAsync(ci => ci.Name == consumableItem.Name &&
                            ci.CaloriesPer100g == consumableItem.CaloriesPer100g &&
                            ci.ProteinPer100g == consumableItem.ProteinPer100g &&
                            ci.CarbohydratePer100g == consumableItem.CarbohydratePer100g &&
                            ci.FatPer100g == consumableItem.FatPer100g &&
                            ci.Type == consumableItem.Type);
        }
    }
}
