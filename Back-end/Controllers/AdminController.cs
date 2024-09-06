namespace Fitness_Tracker.Controllers
{
    using Fitness_Tracker.Models.Admins;
    using Fitness_Tracker.Services.Admins;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using System.Security.Claims;

    using static Constants.AdminController;
    using static Constants.General;

    [Authorize(Policy = "RequireAdministratorRole")]
    public class AdminController : BaseApiController
    {

        private readonly IAdminService _adminService;

        public AdminController(IAdminService adminService)
        {
            this._adminService = adminService;
        }

        [HttpPost(AddConsumableItemHttpAttributeName)]
        public async Task<IActionResult> AddConsumableItem([FromBody] AddConsumableItemModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { Message = InvalidModelStateError });
            }       

            var validationResult = ValidateUserAuthentication(out var userId);
            if (validationResult != null)
            {
                return validationResult;
            }

            var consumableItemExists = await _adminService.ConsumableItemExistsAsync(model);
            if (consumableItemExists)
            {
                return BadRequest(new { Message = ConsumableItemExists });
            }

            await _adminService.CreateConsumableItemAsync(model);

            return Ok(new { Message = ConsumableItemAddedSuccessfully });
        }

        [HttpPost(AddActivityCategoryHttpAttributeName)]
        public async Task<IActionResult> AddActivityCategory([FromBody] AddActivityCategoryModel model)
        {
            if(!ModelState.IsValid)
            {
                return BadRequest(new { Message = InvalidModelStateError });
            }

            var validationResult = ValidateUserAuthentication(out var userId);
            if (validationResult != null)
            {
                return validationResult;
            }

            var activityCategoryExists = await _adminService.ActivityCategoryExistsAsync(model);
            if (activityCategoryExists)
            {
                return BadRequest(new { Message = ActivityCategoryExists });
            }

            await _adminService.AddActivityCategoryAsync(model);

            return Ok(new { Message = ActivityCategoryAddedSuccessfully });
        }

        [HttpPost(AddActivityTypeHttpAttributeName)]
        public async Task<IActionResult> AddActivityType([FromBody] AddActivityTypeModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { Message = InvalidModelStateError });
            }

            var validationResult = ValidateUserAuthentication(out var userId);
            if (validationResult != null)
            {
                return validationResult;
            }

            var activityTypeExists = await _adminService.ActivityTypeExistsAsync(model);
            if (activityTypeExists)
            {
                return BadRequest(new { Message = ActivityTypeExists });
            }

            await _adminService.AddActivityTypeAsync(model);

            return Ok(new { Message = ActivityTypeAddedSuccessfully });
        }

        [HttpGet(GetActivityCategoriesHttpAttributeName)]
        public IActionResult GetActivityCategories()
        {
            var validationResult = ValidateUserAuthentication(out var userId);
            if (validationResult != null)
            {
                return validationResult;
            }

            var allCategories = _adminService.GetAllActivityCategories();

            return Ok(allCategories);
        }

        private string GetUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }

        private IActionResult ValidateUserAuthentication(out string userId)
        {
            userId = GetUserId();

            if (userId == null)
            {
                return Unauthorized(new { Message = UserIsNotAuthenticatedError });
            }

            return null;
        }
    }
}
