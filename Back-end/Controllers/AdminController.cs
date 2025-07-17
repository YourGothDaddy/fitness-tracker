namespace Fitness_Tracker.Controllers
{
    using Fitness_Tracker.Models.Admins;
    using Fitness_Tracker.Services.Admins;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using System.Security.Claims;

    using static Constants.AdminController;
    using static Constants.General;

    /// <summary>
    /// Controller responsible for administrative operations, including managing consumable items, activity categories, and activity types.
    /// </summary>
    [Authorize(Policy = "RequireAdministratorRole")]
    public class AdminController : BaseApiController
    {

        private readonly IAdminService _adminService;

        /// <summary>
        /// Initializes a new instance of the <see cref="AdminController"/> class.
        /// </summary>
        /// <param name="adminService">The admin service used for administrative operations.</param>
        public AdminController(IAdminService adminService)
        {
            this._adminService = adminService;
        }

        /// <summary>
        /// Adds a new consumable item to the system.
        /// </summary>
        /// <param name="model">The model containing details of the consumable item to add.</param>
        /// <returns>An <see cref="IActionResult"/> indicating the result of the operation.</returns>
        /// <remarks>
        /// Returns 400 if the model state is invalid or if the consumable item already exists. Returns 401 if the user is not authenticated. Returns 200 if the item is added successfully.
        /// </remarks>
        /// <response code="200">Consumable item added successfully.</response>
        /// <response code="400">Invalid model state or consumable item already exists.</response>
        /// <response code="401">User is not authenticated.</response>
        /// <example>
        /// Sample request:
        /// {
        ///   "Name": "Banana",
        ///   "Calories": 89,
        ///   "Nutrients": [ ... ]
        /// }
        /// </example>
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

        /// <summary>
        /// Adds a new activity category to the system.
        /// </summary>
        /// <param name="model">The model containing details of the activity category to add.</param>
        /// <returns>An <see cref="IActionResult"/> indicating the result of the operation.</returns>
        /// <remarks>
        /// Returns 400 if the model state is invalid or if the activity category already exists. Returns 401 if the user is not authenticated. Returns 200 if the category is added successfully.
        /// </remarks>
        /// <response code="200">Activity category added successfully.</response>
        /// <response code="400">Invalid model state or activity category already exists.</response>
        /// <response code="401">User is not authenticated.</response>
        /// <example>
        /// Sample request:
        /// {
        ///   "Name": "Cardio",
        ///   "Description": "Aerobic exercises that increase heart rate."
        /// }
        /// </example>
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

        /// <summary>
        /// Adds a new activity type to the system.
        /// </summary>
        /// <param name="model">The model containing details of the activity type to add.</param>
        /// <returns>An <see cref="IActionResult"/> indicating the result of the operation.</returns>
        /// <remarks>
        /// Returns 400 if the model state is invalid or if the activity type already exists. Returns 401 if the user is not authenticated. Returns 200 if the type is added successfully.
        /// </remarks>
        /// <response code="200">Activity type added successfully.</response>
        /// <response code="400">Invalid model state or activity type already exists.</response>
        /// <response code="401">User is not authenticated.</response>
        /// <example>
        /// Sample request:
        /// {
        ///   "Name": "Running",
        ///   "CategoryId": 1,
        ///   "Description": "Outdoor running activity."
        /// }
        /// </example>
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

        /// <summary>
        /// Retrieves all activity categories in the system.
        /// </summary>
        /// <returns>An <see cref="IActionResult"/> containing a list of all activity categories.</returns>
        /// <remarks>
        /// Returns 401 if the user is not authenticated. Returns 200 with the list of categories if successful.
        /// </remarks>
        /// <response code="200">Returns a list of activity categories.</response>
        /// <response code="401">User is not authenticated.</response>
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
