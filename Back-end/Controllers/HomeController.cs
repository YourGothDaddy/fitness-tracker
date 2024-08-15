namespace Fitness_Tracker.Controllers
{
    using Microsoft.AspNetCore.Mvc;

    [ApiController]
    [Route("api/[controller]")]
    public class HomeController : Controller
    {
        [HttpGet]   
        public IActionResult Index()
        {
            return Ok("At index page");
        }
    }
}
