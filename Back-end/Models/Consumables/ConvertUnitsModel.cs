namespace Fitness_Tracker.Models.Consumables
{
    using System.ComponentModel.DataAnnotations;

    public class ConvertUnitsRequest
    {
        [Required]
        public double Amount { get; set; }

        [Required]
        public string Unit { get; set; } = string.Empty; // e.g., g, ml, tsp, tbsp, cup, oz, piece

        // Required when Unit == "piece" in order to convert pieces to grams
        public double? GramsPerPiece { get; set; }
    }

    public class ConvertUnitsResponse
    {
        public double Grams { get; set; }
    }
}



