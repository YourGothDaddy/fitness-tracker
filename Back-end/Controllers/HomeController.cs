namespace Fitness_Tracker.Controllers
{
    using Microsoft.AspNetCore.Mvc;
    public class HomeController : BaseApiController
    {
        [HttpGet]   
        public IActionResult Index()
        {
            return Ok("At index page");
        }
    }
}
