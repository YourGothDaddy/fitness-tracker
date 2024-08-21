namespace Fitness_Tracker.Infrastructure
{
    using Fitness_Tracker.Data.Models.Enums;
    using Microsoft.AspNetCore.Mvc.ModelBinding;

    public class MealOfTheDayBinder : IModelBinder
    {
        public Task BindModelAsync(ModelBindingContext bindingContext)
        {
            var value = bindingContext.ValueProvider.GetValue(bindingContext.ModelName).FirstValue;

            if (Enum.TryParse(typeof(MealOfTheDay), value, true, out var result))
            {
                bindingContext.Result = ModelBindingResult.Success(result);
            }
            else
            {
                bindingContext.ModelState.AddModelError(bindingContext.ModelName, $"Invalid value: {value}");
            }

            return Task.CompletedTask;
        }
    }
}
