namespace Fitness_Tracker.Models.Admins
{
    using Fitness_Tracker.Data.Models.Consumables;
    using Fitness_Tracker.Data.Models.Enums;
    using System.ComponentModel.DataAnnotations;

    public class AddConsumableItemModel
    {
        [Required]
        public string Name { get; set; }
        [Required]
        public int CaloriesPer100g { get; set; }
        [Required]
        public double ProteinPer100g { get; set; }
        [Required]
        public double CarbohydratePer100g { get; set; }
        [Required]
        public double FatPer100g { get; set; }
        [Required]
        public TypeOfConsumable Type { get; set; }
        public List<Nutrient> NutritionalInformation { get; set; } = new List<Nutrient>();
        /// <summary>
        /// Whether the food item is public. Defaults to true. (For future use)
        /// </summary>
        public bool IsPublic { get; set; } = true;
        /// <summary>
        /// The user who created this food (for backend use; not required from client)
        /// </summary>
        public string? UserId { get; set; }
        public string? SubTitle { get; set; } // Now nullable
        public string? MainCategory { get; set; } // Main category for the consumable item
    }
}
