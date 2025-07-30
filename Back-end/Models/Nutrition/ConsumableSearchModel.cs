using System.ComponentModel.DataAnnotations;

namespace Fitness_Tracker.Models.Nutrition
{
    public class ConsumableSearchModel
    {
        public string? SearchQuery { get; set; }
        
        [Range(1, int.MaxValue, ErrorMessage = "Page number must be greater than 0")]
        public int PageNumber { get; set; } = 1;
        
        [Range(1, 100, ErrorMessage = "Page size must be between 1 and 100")]
        public int PageSize { get; set; } = 20;
        
        public ConsumableSearchFilter Filter { get; set; } = ConsumableSearchFilter.All;
    }

    public enum ConsumableSearchFilter
    {
        All,
        Public,
        Custom,
        Favorites
    }
}