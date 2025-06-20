namespace Fitness_Tracker.Models.Users
{
    public class MacroSettingsModel
    {
        public int MacroMode { get; set; } // 0 = Ratios, 1 = Fixed
        public int TotalKcal { get; set; }
        public int? ProteinRatio { get; set; }
        public int? CarbsRatio { get; set; }
        public int? FatRatio { get; set; }
        public int? ProteinKcal { get; set; }
        public int? CarbsKcal { get; set; }
        public int? FatKcal { get; set; }
    }
} 