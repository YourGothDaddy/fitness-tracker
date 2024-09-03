namespace Fitness_Tracker.Services.Admins
{
    using Fitness_Tracker.Models.Admins;

    public interface IAdminService
    {
        public Task CreateConsumableItemAsync(AddConsumableItemModel consumableItem);

        public Task<bool> ConsumableItemExistsAsync(AddConsumableItemModel consumableItem);
    }
}
