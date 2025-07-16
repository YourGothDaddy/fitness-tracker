namespace Fitness_Tracker.Services.Consumables
{
    public interface IConsumableService
    {
        public Task<List<string>> GetMatchingConsumableItemsAsync(string query);
        public Task AddConsumableItemAsync(Models.Admins.AddConsumableItemModel model);
        public Task<List<Fitness_Tracker.Data.Models.Consumables.ConsumableItem>> GetAllPublicConsumableItemsAsync();
        Task AddFavoriteConsumableItemAsync(string userId, int consumableItemId);
        Task RemoveFavoriteConsumableItemAsync(string userId, int consumableItemId);
        Task<bool> IsFavoriteConsumableItemAsync(string userId, int consumableItemId);
        Task<List<Data.Models.Consumables.ConsumableItem>> GetFavoriteConsumableItemsAsync(string userId);
    }
}
