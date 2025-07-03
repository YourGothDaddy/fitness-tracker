namespace Fitness_Tracker.Services.Consumables
{
    public interface IConsumableService
    {
        public Task<List<string>> GetMatchingConsumableItemsAsync(string query);
        public Task AddConsumableItemAsync(Models.Admins.AddConsumableItemModel model);
        public Task<List<Fitness_Tracker.Data.Models.Consumables.ConsumableItem>> GetAllPublicConsumableItemsAsync();
    }
}
