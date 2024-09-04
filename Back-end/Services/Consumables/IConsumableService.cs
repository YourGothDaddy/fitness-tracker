namespace Fitness_Tracker.Services.Consumables
{
    public interface IConsumableService
    {
        public Task<List<string>> GetMatchingConsumableItemsAsync(string query);
    }
}
