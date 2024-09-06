namespace Fitness_Tracker.Services.Admins
{
    using Fitness_Tracker.Data.Models;
    using Fitness_Tracker.Models.Admins;

    public interface IAdminService
    {
        public Task CreateConsumableItemAsync(AddConsumableItemModel consumableItem);

        public Task<bool> ConsumableItemExistsAsync(AddConsumableItemModel consumableItem);
        public Task AddActivityCategoryAsync(AddActivityCategoryModel model);
        public Task<bool> ActivityCategoryExistsAsync(AddActivityCategoryModel model);
        public Task AddActivityTypeAsync(AddActivityTypeModel model);
        public Task<bool> ActivityTypeExistsAsync(AddActivityTypeModel model);
        public IEnumerable<ActivityCategory> GetAllActivityCategories();
    }
}
