using System;
using System.Collections.Generic;

namespace Back_end.Models.Nutrition
{
    public class OtherNutrientsModel
    {
        public DateTime Date { get; set; }
        public List<OtherNutrient> Nutrients { get; set; }
    }

    public class OtherNutrient
    {
        public string Label { get; set; }
        public double? Consumed { get; set; }
        public double Required { get; set; }
    }
} 