namespace Fitness_Tracker.Controllers
{
    using Fitness_Tracker.Data.Models;
    using Fitness_Tracker.Models.Users;
    using Fitness_Tracker.Services.Users;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.IdentityModel.Tokens;
    using System.IdentityModel.Tokens.Jwt;
    using System.Security.Claims;
    using System.Text;
    using static Constants.UserController;

    public class UserController : BaseApiController
    {
        private readonly IUserService _userService;
        private readonly IConfiguration _configuration;

        public UserController(IConfiguration configuration, IUserService userService)
        {
            _configuration = configuration;
            _userService = userService;
        }

        // PUBLIC METHODS

        [HttpPost(LogoutHttpAttributeName)]
        public IActionResult Logout()
        {
            SetJwtCookie("", expireDate: DateTime.UtcNow.AddDays(-1));
            return Ok();
        }

        [HttpGet(AuthStatusHttpAttributeName)]
        public async Task<IActionResult> AuthStatus()
        {
            var user = await GetAuthenticatedUserAsync();

            if (user == null)
            {
                return Unauthorized();
            }

            var roles = await _userService.GetUserRolesAsync(user);

            return Ok(new { user.Email, user.UserName, roles });
        }

        [HttpGet(ProfileHttpAttributeName)]
        public async Task<IActionResult> Profile()
        {
            var user = await GetAuthenticatedUserAsync();

            if (user == null)
            {
                return Unauthorized();
            }

            return Ok(new { user.Email });
        }

        [HttpPost(ChangeProfileInfoHttpAttributeName)]
        public async Task<IActionResult> ChangeProfileInfo([FromBody] ChangeProfileInfoModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await GetAuthenticatedUserAsync();

            if (user == null)
            {
                return Unauthorized();
            }

            if (!string.Equals(user.Email, model.Email, StringComparison.OrdinalIgnoreCase))
            {
                if (await _userService.FindUserByEmailAsync(model.Email) != null)
                {
                    return BadRequest(new { Message = EmailIsAlreadyInUse });
                }

                user.Email = model.Email;
                user.NormalizedEmail = model.Email.ToUpperInvariant(); // Normalize the email

                await _userService.UpdateUserAsync(user);
            }

            return Ok();
        }

        [HttpGet(GoalsInfoHttpAttributeName)]
        public async Task<IActionResult> GoalsInfo()
        {
            var user = await GetAuthenticatedUserAsync();

            if (user == null)
            {
                return Unauthorized();
            }

            var goalsInfo = new GoalsInfoModel
            {
                DailyCaloriesGoal = user.DailyCaloriesGoal,
                MonthlyCaloriesGoal = user.MonthlyCaloriesGoal,
                Weight = user.Weight,
                GoalWeight = user.GoalWeight,
                Height = user.Height,
                IsDailyCaloriesGoal = user.IsDailyCaloriesGoal
            };

            return Ok(goalsInfo);
        }

        [HttpPost(ChangeGoalsInfoHttpAttributeName)]
        public async Task<IActionResult> ChangeGoalsAndDataInfo([FromBody] GoalsInfoModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await GetAuthenticatedUserAsync();

            if (user == null)
            {
                return Unauthorized();
            }

            bool isUpdated = UpdateUserGoals(user, model);

            if (isUpdated)
            {
                await _userService.UpdateUserAsync(user);
            }

            return Ok();
        }

        // PRIVATE METHODS

        private async Task<User> GetAuthenticatedUserAsync()
        {
            string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            return userId == null ? null : await _userService.FindUserByIdAsync(userId);
        }

        private void SetJwtCookie(string tokenString, DateTime? expireDate = null)
        {
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Expires = expireDate ?? DateTime.UtcNow.AddDays(7),
                Secure = true,
                SameSite = SameSiteMode.None
            };

            Response.Cookies.Append("jwt", tokenString, cookieOptions);
        }

        private async Task<string> CreateJWT(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"]);

            // Get user roles
            var userRoles = await _userService.GetUserRolesAsync(user);

            // Create the claims, including roles
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Email, user.Email)
            };

            // Add roles as claims
            claims.AddRange(userRoles.Select(role => new Claim(ClaimTypes.Role, role)));

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Audience"]
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }


        private bool UpdateUserGoals(User user, GoalsInfoModel model)
        {
            bool isUpdated = false;

            if (user.DailyCaloriesGoal != model.DailyCaloriesGoal)
            {
                user.DailyCaloriesGoal = model.DailyCaloriesGoal;
                isUpdated = true;
            }

            if (user.MonthlyCaloriesGoal != model.MonthlyCaloriesGoal)
            {
                user.MonthlyCaloriesGoal = model.MonthlyCaloriesGoal;
                isUpdated = true;
            }

            if (user.Weight != model.Weight)
            {
                user.Weight = model.Weight;
                isUpdated = true;
            }

            if (user.GoalWeight != model.GoalWeight)
            {
                user.GoalWeight = model.GoalWeight;
                isUpdated = true;
            }

            if (user.Height != model.Height)
            {
                user.Height = model.Height;
                isUpdated = true;
            }

            if (user.IsDailyCaloriesGoal != model.IsDailyCaloriesGoal)
            {
                user.IsDailyCaloriesGoal = model.IsDailyCaloriesGoal;
                isUpdated = true;
            }

            return isUpdated;
        }
    }
}
