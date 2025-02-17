namespace Fitness_Tracker.Controllers
{
    using Fitness_Tracker.Data;
    using Fitness_Tracker.Data.Models;
    using Fitness_Tracker.Models.Users;
    using Fitness_Tracker.Services.Tokens;
    using Fitness_Tracker.Services.Users;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Mvc;

    using static Constants.UserController;

    public class AuthController : BaseApiController
    {
        private readonly UserManager<User> _userManager;
        private readonly ITokenService _tokenService;
        private readonly IUserService _userService;
        private readonly ApplicationDbContext _context;

        public AuthController(UserManager<User> userManager, ITokenService tokenService, IUserService userService, ApplicationDbContext context)
        {
            _userManager = userManager;
            _tokenService = tokenService;
            _context = context;
        }

        [HttpPost(RegisterHttpAttributeName)]

        public async Task<IActionResult> Register([FromBody] RegisterModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (await _userService.FindUserByEmailAsync(model.Email) != null)
            {
                return BadRequest(new { Message = UserExistsError });
            }

            var user = new User
            {
                FullName = model.FullName,
                UserName = model.Email,
                Email = model.Email,
                Gender = model.Gender,
                Weight = model.Weight,
                Height = model.Height,
                Age = model.Age,
                ActivityLevelId = model.ActivityLevelId,
                WeeklyWeightChangeGoal = model.WeeklyWeightChangeGoal
            };

            var result = await _userManager.CreateAsync(user, model.Password);
            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            return Ok();
        }
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _userService.FindUserByEmailAsync(model.Email);

            bool userIsNullOrPasswordIsIncorrect = user == null || !await _userService.CheckUserAndPasswordMatchAsync(user, model.Password);

            if (userIsNullOrPasswordIsIncorrect)
            {
                return Unauthorized();
            }

            var accessToken = _tokenService.GenerateToken(user);

            return Ok(accessToken);
        }

    }
}
