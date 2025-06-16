namespace Fitness_Tracker.Controllers
{
    using Fitness_Tracker.Data.Models;
    using Fitness_Tracker.Models.Users;
    using Fitness_Tracker.Services.Users;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.IdentityModel.Tokens;
    using System.IdentityModel.Tokens.Jwt;
    using System.Security.Claims;
    using System.Text;
    using static Constants.UserController;

    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IConfiguration _configuration;
        private readonly UserManager<User> _userManager;

        public UserController(IConfiguration configuration, IUserService userService, UserManager<User> userManager)
        {
            _configuration = configuration;
            _userService = userService;
            _userManager = userManager;
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

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var user = await _userService.GetUserProfileAsync(userId);
            if (user == null)
            {
                return NotFound();
            }

            return Ok(new
            {
                user.FullName,
                user.Email,
                user.PhoneNumber,
                user.NotificationsEnabled
            });
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var user = await _userService.FindUserByIdAsync(userId);
            if (user == null)
            {
                return NotFound();
            }

            var result = await _userService.UpdateProfileAsync(user, model);
            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            return Ok(new { Message = "Profile updated successfully" });
        }

        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var user = await _userService.FindUserByIdAsync(userId);
            if (user == null)
            {
                return NotFound();
            }

            var result = await _userService.ChangePasswordAsync(user, model.CurrentPassword, model.NewPassword);
            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            return Ok(new { Message = "Password changed successfully" });
        }

        [HttpPut("notifications")]
        public async Task<IActionResult> UpdateNotifications([FromBody] UpdateNotificationsModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var user = await _userService.FindUserByIdAsync(userId);
            if (user == null)
            {
                return NotFound();
            }

            var result = await _userService.UpdateNotificationsAsync(user, model.NotificationsEnabled);
            if (!result)
            {
                return BadRequest(new { Message = "Failed to update notification preferences" });
            }

            return Ok(new { Message = "Notification preferences updated successfully" });
        }

        [HttpGet("profile-data")]
        public async Task<IActionResult> GetProfileData()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var profileData = await _userService.GetProfileDataAsync(userId);
            if (profileData == null)
            {
                return NotFound();
            }

            return Ok(profileData);
        }

        [HttpPut("profile-data")]
        public async Task<IActionResult> UpdateProfileData([FromBody] ProfileModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var result = await _userService.UpdateProfileDataAsync(userId, model);
            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            return Ok(new { Message = "Profile data updated successfully" });
        }

        // PRIVATE METHODS

        private async Task<User> GetAuthenticatedUserAsync()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return userId != null ? await _userService.FindUserByIdAsync(userId) : null;
        }

        private void SetJwtCookie(string tokenString, DateTime? expireDate = null)
        {
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = expireDate ?? DateTime.UtcNow.AddDays(7)
            };

            Response.Cookies.Append("jwt", tokenString, cookieOptions);
        }

        private async Task<string> CreateJWT(User user)
        {
            var roles = await _userService.GetUserRolesAsync(user);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.UserName)
            };

            claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JWT:Secret"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expires = DateTime.Now.AddDays(Convert.ToDouble(_configuration["JWT:ExpireDays"]));

            var token = new JwtSecurityToken(
                _configuration["JWT:ValidIssuer"],
                _configuration["JWT:ValidAudience"],
                claims,
                expires: expires,
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
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
