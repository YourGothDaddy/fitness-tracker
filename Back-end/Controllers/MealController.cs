namespace Fitness_Tracker.Controllers
{
    using Microsoft.AspNetCore.Mvc;
    public class MealController : BaseApiController
    {
        [HttpGet]
        public IActionResult Index()
        {
            return Ok("At meal page");
        }
    }
}
