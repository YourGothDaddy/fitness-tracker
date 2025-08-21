using Fitness_Tracker.Data;
using Microsoft.EntityFrameworkCore;
using Fitness_Tracker.Models.Admins;
using Fitness_Tracker.Data.Models.Consumables;
using Fitness_Tracker.Models.Nutrition;
using Fitness_Tracker.Models;

namespace Fitness_Tracker.Services.Consumables
{
    public class ConsumableService : IConsumableService
    {
        private readonly ApplicationDbContext _databaseContext;
        private readonly ILogger<ConsumableService> _logger;

        public ConsumableService(ApplicationDbContext databaseContext, ILogger<ConsumableService> logger)
        {
            _databaseContext = databaseContext;
            _logger = logger;
        }

        public async Task<PagedResult<ConsumableItem>> SearchConsumableItemsAsync(
            string query, 
            int pageNumber, 
            int pageSize, 
            ConsumableSearchFilter filter,
            string? userId = null)
        {
            try
            {
                _logger.LogInformation(
                    "Starting search operation. Query: {Query}, Filter: {Filter}, UserId: {UserId}",
                    query, filter, userId ?? "anonymous");

                // Start with base query
                IQueryable<ConsumableItem> baseQuery = _databaseContext.ConsumableItems;

                            // Apply search filter
            query ??= string.Empty;
            if (!string.IsNullOrWhiteSpace(query))
            {
                baseQuery = baseQuery.Where(ci => 
                    ci.Name.Contains(query) || 
                    (ci.SubTitle != null && ci.SubTitle.Contains(query))
                );
                _logger.LogDebug("Applied search filter for query: {Query}", query);
            }
            else
            {
                _logger.LogDebug("No search filter applied (empty query)");
            }

                // Apply type filter
                switch (filter)
                {
                    case ConsumableSearchFilter.Public:
                        baseQuery = baseQuery.Where(ci => ci.IsPublic);
                        _logger.LogDebug("Applied Public filter");
                        break;
                    case ConsumableSearchFilter.Custom when !string.IsNullOrEmpty(userId):
                        baseQuery = baseQuery.Where(ci => ci.UserId == userId);
                        _logger.LogDebug("Applied Custom filter for user {UserId}", userId);
                        break;
                    case ConsumableSearchFilter.Favorites when !string.IsNullOrEmpty(userId):
                        baseQuery = baseQuery.Where(ci => 
                            _databaseContext.UserFavoriteConsumableItems
                                .Any(f => f.UserId == userId && f.ConsumableItemId == ci.Id)
                        );
                        _logger.LogDebug("Applied Favorites filter for user {UserId}", userId);
                        break;
                    case ConsumableSearchFilter.All:
                        if (!string.IsNullOrEmpty(userId))
                        {
                            baseQuery = baseQuery.Where(ci => ci.IsPublic || ci.UserId == userId);
                            _logger.LogDebug("Applied All filter (public + user items) for user {UserId}", userId);
                        }
                        else
                        {
                            baseQuery = baseQuery.Where(ci => ci.IsPublic);
                            _logger.LogDebug("Applied All filter (public items only) for anonymous user");
                        }
                        break;
                }

                // Log the generated SQL query for debugging
                var queryString = baseQuery.ToString();
                _logger.LogDebug("Generated SQL query: {Query}", queryString);

                // Get total count for pagination
                var totalCount = await baseQuery.CountAsync();
                _logger.LogDebug("Total count before pagination: {TotalCount}", totalCount);

                // Apply pagination
                var items = await baseQuery
                    .OrderBy(ci => ci.Name)
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                _logger.LogInformation(
                    "Search completed successfully. Found {ItemCount} items out of {TotalCount} total",
                    items.Count, totalCount);

                return new PagedResult<ConsumableItem>
                {
                    Items = items,
                    TotalCount = totalCount,
                    PageNumber = pageNumber,
                    PageSize = pageSize
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, 
                    "Error occurred during search operation. Query: {Query}, Filter: {Filter}, UserId: {UserId}",
                    query, filter, userId ?? "anonymous");
                throw; // Rethrow to maintain the exception chain
            }
        }

        public async Task<List<ConsumableItem>> GetAllPublicConsumableItemsAsync()
        {
            return await this._databaseContext.ConsumableItems
                .Where(ci => ci.IsPublic)
                .ToListAsync();
        }

        public async Task<Models.PagedResult<ConsumableItem>> GetPublicConsumableItemsPagedAsync(int pageNumber, int pageSize)
        {
            var query = _databaseContext.ConsumableItems.Where(ci => ci.IsPublic);
            var totalCount = await query.CountAsync();
            var items = await query
                .OrderBy(ci => ci.Id)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
            return new Models.PagedResult<ConsumableItem>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task AddConsumableItemAsync(AddConsumableItemModel model, string? userId = null)
        {
            var newConsumableItem = new ConsumableItem
            {
                Name = model.Name,
                SubTitle = model.SubTitle,
                MainCategory = model.MainCategory,
                CaloriesPer100g = model.CaloriesPer100g,
                ProteinPer100g = model.ProteinPer100g,
                CarbohydratePer100g = model.CarbohydratePer100g,
                FatPer100g = model.FatPer100g,
                Type = model.Type,
                NutritionalInformation = model.NutritionalInformation ?? new List<Nutrient>(),
                IsPublic = model.IsPublic,
                UserId = userId
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

        public async Task<List<ConsumableItem>> GetAllUserCustomConsumableItemsAsync(string userId)
        {
            return await _databaseContext.ConsumableItems
                .Where(ci => !ci.IsPublic && ci.UserId == userId)
                .ToListAsync();
        }
    }
}
