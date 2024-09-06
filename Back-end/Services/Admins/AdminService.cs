namespace Fitness_Tracker.Services.Admins
{
    using Fitness_Tracker.Data;
    using Fitness_Tracker.Data.Models;
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

        public async Task AddActivityCategoryAsync(AddActivityCategoryModel model)
        {
            var newActivityCategory = new ActivityCategory
            {
                Name = model.Name
            };

            await _databaseContext
                .ActivityCategories
                .AddAsync(newActivityCategory);

            await _databaseContext
                .SaveChangesAsync();
        }

        public async Task<bool> ActivityCategoryExistsAsync(AddActivityCategoryModel model)
        {
            return await _databaseContext
                .ActivityCategories
                .AnyAsync(ci => ci.Name == model.Name);
        }

        public async Task AddActivityTypeAsync(AddActivityTypeModel model)
        {
            var activityCategory = await _databaseContext
                .ActivityCategories
                .Where(ac => ac.Id == model.ActivityCategoryId)
                .FirstOrDefaultAsync();

            var newActivityType = new ActivityType
            {
                Name = model.Name,
                ActivityCategory = activityCategory,
                ActivityCategoryId = activityCategory.Id
            };

            await _databaseContext
                .ActivityTypes
                .AddAsync(newActivityType);

            await _databaseContext
                .SaveChangesAsync();
        }

        public async Task<bool> ActivityTypeExistsAsync(AddActivityTypeModel model)
        {
            return await _databaseContext
                .ActivityTypes
                .AnyAsync(ci => ci.Name == model.Name);
        }

        public IEnumerable<ActivityCategory> GetAllActivityCategories()
        {
            return _databaseContext
                .ActivityCategories
                .AsEnumerable();
        }
    }
}
