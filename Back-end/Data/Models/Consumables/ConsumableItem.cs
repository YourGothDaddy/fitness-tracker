namespace Fitness_Tracker.Data.Models.Consumables
{
    using Fitness_Tracker.Data.Models.Enums;

    public class ConsumableItem
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string? SubTitle { get; set; } // Now nullable
        public int CaloriesPer100g { get; set; }
        public double ProteinPer100g { get; set; }
        public double CarbohydratePer100g { get; set; }
        public double FatPer100g { get; set; }
        public TypeOfConsumable Type { get; set; }
        public List<Nutrient> NutritionalInformation { get; set; } = new List<Nutrient>();
        /// <summary>
        /// Whether the food item is public/approved. Defaults to true.
        /// </summary>
        public bool IsPublic { get; set; } = true;
        /// <summary>
        /// The user who created this food (null if public/global food)
        /// </summary>
        public string? UserId { get; set; }
        public Fitness_Tracker.Data.Models.User? User { get; set; }
    }


}
