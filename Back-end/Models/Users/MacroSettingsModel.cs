namespace Fitness_Tracker.Models.Users
{
    public class MacroSettingsModel
    {
        public int MacroMode { get; set; } // 0 = Ratios
        public int TotalKcal { get; set; }
        public int? ProteinRatio { get; set; }
        public int? CarbsRatio { get; set; }
        public int? FatRatio { get; set; }
    }
} 