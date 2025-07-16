using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Fitness_Tracker.Data.Models.Consumables;

namespace Fitness_Tracker.Data.Models
{
    public class UserFavoriteConsumableItem
    {
        [Key, Column(Order = 0)]
        public string UserId { get; set; }
        public User User { get; set; }

        [Key, Column(Order = 1)]
        public int ConsumableItemId { get; set; }
        public ConsumableItem ConsumableItem { get; set; }
    }
} 