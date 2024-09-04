namespace Fitness_Tracker.Controllers
{
    using Fitness_Tracker.Services.Consumables;
    using Microsoft.AspNetCore.Mvc;

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
    }
}
