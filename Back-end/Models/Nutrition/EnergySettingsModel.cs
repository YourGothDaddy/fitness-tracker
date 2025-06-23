namespace Fitness_Tracker.Models.Nutrition
{
    public class EnergySettingsModel
    {
        public double BMR { get; set; }
        public double MaintenanceCalories { get; set; }
        public int ActivityLevelId { get; set; }
        public string ActivityLevelName { get; set; }
        public double ActivityMultiplier { get; set; }
        public bool TEFIncluded { get; set; }
    }
} 