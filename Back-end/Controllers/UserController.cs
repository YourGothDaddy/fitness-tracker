namespace Fitness_Tracker.Controllers
{
    using Fitness_Tracker.Data.Models;
    using Fitness_Tracker.Models.Users;
    using Fitness_Tracker.Services.Users;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.IdentityModel.Tokens;
    using System.IdentityModel.Tokens.Jwt;
    using System.Security.Claims;
    using System.Text;
    using static Constants.User;

    public class UserController : BaseApiController
    {
        private readonly IUserService _userService;
        private readonly IConfiguration _configuration;
        public UserController(
            IConfiguration configuration,
            IUserService userService)
        {
            this._configuration = configuration;
            this._userService = userService;
        }

        // PUBLIC METHODS

        [HttpPost(RegisterHttpAttributeName)]
        public async Task<IActionResult> Register([FromBody] RegisterModel model)
        {
            User userInExistence = await _userService.FindUserByEmailAsync(model.Email);
            bool userExists = userInExistence != null;
            if (!userExists)
            {
                User user = new User { UserName = model.Email, Email = model.Email };
                IdentityResult result = await _userService.CreateUserAsync(user, model.Password);

                if (result.Succeeded)
                {
                    return Ok();
                }
            }

            return BadRequest();
        }

        [HttpPost(LoginHttpAttributeName)]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            User user = await _userService.FindUserByEmailAsync(model.Email);
            bool userAndPasswordMatch = await _userService.CheckUserAndPasswordMatchAsync(user, model.Password);

            if (user != null && userAndPasswordMatch)
            {
                string tokenString = CreateJWT(user);
                CookieOptions cookieOptions = SetCookieOptionsToPassJWT(true, DateTime.UtcNow.AddDays(7), true, SameSiteMode.None);

                Response.Cookies.Append("jwt", tokenString, cookieOptions);
                return Ok();
            }

            return Unauthorized();
        }


        [HttpPost(LogoutHttpAttributeName)]
        public IActionResult Logout()
        {
            CookieOptions cookieOptions = SetCookieOptionsToPassJWT(true, DateTime.UtcNow.AddDays(-1), true, SameSiteMode.None);

            Response.Cookies.Append("jwt", "", cookieOptions);
            return Ok();
        }

        [HttpGet(AuthStatusHttpAttributeName)]
        public async Task<IActionResult> AuthStatus()
        {
            User user = await GetAuthenticatedUserAsync();

            if (user == null)
            {
                return Unauthorized();
            }

            return Ok(new
            {
                user.Email,
                user.UserName
            });
        }

        [HttpGet(ProfileHttpAttributeName)]
        public async Task<IActionResult> Profile()
        {
            User user = await GetAuthenticatedUserAsync();

            if (user == null)
            {
                return Unauthorized();
            }

            return Ok(new { user.Email });
        }

        [HttpPost(ChangeProfileInfoHttpAttributeName)]
        public async Task<IActionResult> ChangeProfileInfo(ChangeProfileInfoModel model)
        {
            User user = await GetAuthenticatedUserAsync();

            if (user == null)
            {
                return Unauthorized();
            }

            User userWithRequestedEmail = await _userService.FindUserByEmailAsync(model.Email);

            if (userWithRequestedEmail != null)
            {
                return BadRequest(new { Message = "Email is still being used" });
            }

            bool isUpdated = false;

            if (!string.Equals(user.Email, model.Email, StringComparison.OrdinalIgnoreCase))
            {
                user.Email = model.Email;
                user.NormalizedEmail = model.Email.ToUpperInvariant();  // Normalize the email
                isUpdated = true;
            }

            if (isUpdated)
            {
                await _userService.UpdateUserAsync(user);
                return Ok();
            }


            return Ok();
        }

        [HttpGet(GoalsInfoHttpAttributeName)]
        public async Task<IActionResult> GoalsInfo()
        {
            User user = await GetAuthenticatedUserAsync();

            if(user == null)
            {
                return Unauthorized();
            }

            return Ok(new GoalsInfoModel
            {
                DailyCaloriesGoal = user.DailyCaloriesGoal,
                MonthlyCaloriesGoal = user.MonthlyCaloriesGoal,
                Weight = user.Weight,
                GoalWeight = user.GoalWeight,
                Height = user.Height,
                IsDailyCaloriesGoal = user.IsDailyCaloriesGoal
            });
        }

        [HttpPost(ChangeGoalsInfoHttpAttributeName)]
        public async Task<IActionResult> ChangeGoalsAndDataInfo(GoalsInfoModel model)
        {
            User user = await GetAuthenticatedUserAsync();

            if (user == null)
            {
                return Unauthorized();
            }
                
            bool isUpdated = false;

            if(!int.Equals(user.DailyCaloriesGoal, model.DailyCaloriesGoal))
            {
                user.DailyCaloriesGoal = model.DailyCaloriesGoal;
                isUpdated = true;
            }

            if (!int.Equals(user.MonthlyCaloriesGoal, model.MonthlyCaloriesGoal))
            {
                user.MonthlyCaloriesGoal = model.MonthlyCaloriesGoal;
                isUpdated = true;
            }

            if (!int.Equals(user.Weight, model.Weight))
            {
                user.Weight = model.Weight;
                isUpdated = true;
            }

            if (!int.Equals(user.GoalWeight, model.GoalWeight))
            {
                user.GoalWeight = model.GoalWeight;
                isUpdated = true;
            }

            if (!int.Equals(user.Height, model.Height))
            {
                user.Height = model.Height;
                isUpdated = true;
            }

            if(!bool.Equals(user.IsDailyCaloriesGoal, model.IsDailyCaloriesGoal))
            {
                user.IsDailyCaloriesGoal = model.IsDailyCaloriesGoal;
                isUpdated = true;
            }

            if(isUpdated)
            {
                await _userService.UpdateUserAsync(user);
                return Ok();
            }

            return Ok();
        }

        // PRIVATE METHODS

        private async Task<User> GetAuthenticatedUserAsync()
        {
            string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userId == null)
            {
                return null;
            }

            User user = await _userService.FindUserByIdAsync(userId);

            if (user == null)
            {
                return null;
            }

            return user;
        }
        private static CookieOptions SetCookieOptionsToPassJWT(
            bool isHttpOnly,
            DateTime expireDate,
            bool isSecure,
            SameSiteMode sameSiteMode)
        {
            return new CookieOptions
            {
                HttpOnly = isHttpOnly,
                Expires = expireDate,
                Secure = isSecure,
                SameSite = sameSiteMode
            };
        }

        private string CreateJWT(User? user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"]);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                        new Claim(ClaimTypes.NameIdentifier, user.Id),
                        new Claim(ClaimTypes.Email, user.Email)
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Audience"]
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);
            return tokenString;
        }
    }
}
