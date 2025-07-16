namespace Fitness_Tracker.Controllers
{
    using Fitness_Tracker.Services.Consumables;
    using Microsoft.AspNetCore.Mvc;
    using Fitness_Tracker.Models.Admins;

    using static Constants.ConsumableController;

    public class ConsumableController : BaseApiController
    {
        private readonly IConsumableService _consumableService;

        public ConsumableController(IConsumableService consumableService)
        {
            this._consumableService = consumableService;
        }

        [HttpGet(SearchConsumableItemHttpAttributeName)]
        public async Task<IActionResult> SearchConsumables([FromQuery] string query)
        {
            var results = await _consumableService.GetMatchingConsumableItemsAsync(query);

            return Ok(results);
        }

        /// <summary>
        /// Adds a new consumable item (food) to the database. The item is public by default.
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
                await _consumableService.AddConsumableItemAsync(model);
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
    }
}
