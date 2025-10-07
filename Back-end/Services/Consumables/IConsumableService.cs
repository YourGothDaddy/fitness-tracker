using Fitness_Tracker.Models.Nutrition;
using Fitness_Tracker.Data.Models.Consumables;

namespace Fitness_Tracker.Services.Consumables
{
    public interface IConsumableService
    {
        Task<Models.PagedResult<ConsumableItem>> SearchConsumableItemsAsync(string query, int pageNumber, int pageSize, ConsumableSearchFilter filter, string? userId = null, string? category = null);
        Task AddConsumableItemAsync(Models.Admins.AddConsumableItemModel model, string? userId = null);
        Task<List<ConsumableItem>> GetAllPublicConsumableItemsAsync();
        Task<Models.PagedResult<ConsumableItem>> GetPublicConsumableItemsPagedAsync(int pageNumber, int pageSize);
        Task AddFavoriteConsumableItemAsync(string userId, int consumableItemId);
        Task RemoveFavoriteConsumableItemAsync(string userId, int consumableItemId);
        Task<bool> IsFavoriteConsumableItemAsync(string userId, int consumableItemId);
        Task<List<ConsumableItem>> GetFavoriteConsumableItemsAsync(string userId);
        Task<List<ConsumableItem>> GetAllUserCustomConsumableItemsAsync(string userId);
        Task<List<string>> GetDistinctConsumableCategoriesAsync(string? userId = null);
        Task<double> ConvertToGramsAsync(Fitness_Tracker.Models.Consumables.ConvertUnitsRequest request);
    }
}
