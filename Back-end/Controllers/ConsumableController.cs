namespace Fitness_Tracker.Controllers
{
    using Fitness_Tracker.Services.Consumables;
    using Microsoft.AspNetCore.Mvc;
    using Fitness_Tracker.Models.Admins;
    using Fitness_Tracker.Models.Nutrition;

    using static Constants.ConsumableController;

    public class ConsumableController : BaseApiController
    {
        private readonly IConsumableService _consumableService;
        private readonly ILogger<ConsumableController> _logger;

        public ConsumableController(IConsumableService consumableService, ILogger<ConsumableController> logger)
        {
            _consumableService = consumableService;
            _logger = logger;
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchConsumables([FromQuery] ConsumableSearchModel searchModel)
        {
            try
            {
                _logger.LogInformation(
                    "Search request received. Query: {SearchQuery}, Page: {PageNumber}, Size: {PageSize}, Filter: {Filter}",
                    searchModel.SearchQuery ?? "(empty)", searchModel.PageNumber, searchModel.PageSize, searchModel.Filter);

                // Initialize searchModel.SearchQuery if it's null
                searchModel.SearchQuery ??= string.Empty;

                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();
                    
                    _logger.LogWarning("Invalid search model state: {Errors}", 
                        string.Join("; ", errors));
                    
                    return BadRequest(new { 
                        Message = "Invalid search parameters.",
                        Errors = errors
                    });
                }

                var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                _logger.LogInformation("Executing search for user {UserId}", userId ?? "anonymous");

                var results = await _consumableService.SearchConsumableItemsAsync(
                    searchModel.SearchQuery,
                    searchModel.PageNumber,
                    searchModel.PageSize,
                    searchModel.Filter,
                    userId
                );

                _logger.LogInformation(
                    "Search completed successfully. Found {ItemCount} items out of {TotalCount} total",
                    results.Items.Count, results.TotalCount);

                return Ok(results);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, 
                    "Error occurred while searching foods. Query: {SearchQuery}, Filter: {Filter}", 
                    searchModel.SearchQuery, searchModel.Filter);
                
                return StatusCode(500, new { 
                    Message = "An error occurred while searching food items.", 
                    Details = ex.Message,
                    StackTrace = ex.StackTrace // Only in development
                });
            }
        }

        /// <summary>
        /// Adds a new consumable item (food) to the database. The item can be public or custom (user-specific).
        /// </summary>
        /// <param name="model">The food item to add.</param>
        /// <returns>Result of the add operation.</returns>
        [HttpPost("add")]
        public async Task<IActionResult> AddConsumable([FromBody] AddConsumableItemModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { Message = "Invalid data." });
            }
            try
            {
                var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                // If IsPublic is false, associate with user; if true, userId is null (admin/global food)
                await _consumableService.AddConsumableItemAsync(model, model.IsPublic ? null : userId);
                return Ok(new { Message = "Food item added successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while adding the food item.", Details = ex.Message });
            }
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAllPublicConsumableItems()
        {
            var items = await _consumableService.GetAllPublicConsumableItemsAsync();
            return Ok(items);
        }

        [HttpGet("custom")]
        public async Task<IActionResult> GetAllUserCustomConsumableItems()
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();
            var items = await _consumableService.GetAllUserCustomConsumableItemsAsync(userId);
            return Ok(items);
        }

        [HttpPost("favorites/add")]
        public async Task<IActionResult> AddFavoriteConsumableItem([FromBody] int consumableItemId)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();
            await _consumableService.AddFavoriteConsumableItemAsync(userId, consumableItemId);
            return Ok(new { Message = "Added to favorites." });
        }

        [HttpPost("favorites/remove")]
        public async Task<IActionResult> RemoveFavoriteConsumableItem([FromBody] int consumableItemId)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();
            await _consumableService.RemoveFavoriteConsumableItemAsync(userId, consumableItemId);
            return Ok(new { Message = "Removed from favorites." });
        }

        [HttpGet("favorites")]
        public async Task<IActionResult> GetFavoriteConsumableItems()
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();
            var favorites = await _consumableService.GetFavoriteConsumableItemsAsync(userId);
            return Ok(favorites);
        }

        [HttpGet("favorites/{consumableItemId}/is-favorite")]
        public async Task<IActionResult> IsFavoriteConsumableItem(int consumableItemId)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();
            var isFavorite = await _consumableService.IsFavoriteConsumableItemAsync(userId, consumableItemId);
            return Ok(new { IsFavorite = isFavorite });
        }

        [HttpGet("paged")]
        public async Task<IActionResult> GetPublicConsumableItemsPaged([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20)
        {
            if (pageNumber < 1 || pageSize < 1 || pageSize > 100)
                return BadRequest(new { Message = "Invalid pagination parameters." });
            var result = await _consumableService.GetPublicConsumableItemsPagedAsync(pageNumber, pageSize);
            return Ok(result);
        }
    }
}
