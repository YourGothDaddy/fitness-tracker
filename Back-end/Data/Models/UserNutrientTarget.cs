using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Fitness_Tracker.Data.Models
{
    public class UserNutrientTarget
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string UserId { get; set; }
        [ForeignKey("UserId")]
        public User User { get; set; }

        [Required]
        public string NutrientName { get; set; } // e.g., "Fiber", "Vitamin A"
        [Required]
        public string Category { get; set; } // e.g., "Carbohydrates", "Vitamins"

        public bool IsTracked { get; set; } = false;
        public double? DailyTarget { get; set; } // mg, g, etc. (frontend can decide unit)
    }
} 