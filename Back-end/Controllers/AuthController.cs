namespace Fitness_Tracker.Controllers
{
    using Fitness_Tracker.Data;
    using Fitness_Tracker.Data.Models;
    using Fitness_Tracker.Models.Users;
    using Fitness_Tracker.Services.Tokens;
    using Fitness_Tracker.Services.Users;
    using Fitness_Tracker.Services.Emails;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.Extensions.Logging;
    using static Constants.AuthController;

    public class AuthController : BaseApiController
    {
        private readonly UserManager<User> _userManager;
        private readonly ITokenService _tokenService;
        private readonly IUserService _userService;
        private readonly IEmailService _emailService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(UserManager<User> userManager, ITokenService tokenService, IUserService userService, IEmailService emailService, ILogger<AuthController> logger)
        {
            _userManager = userManager;
            _tokenService = tokenService;
            _userService = userService;
            _emailService = emailService;
            _logger = logger;
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
                WeeklyWeightChangeGoal = model.WeeklyWeightChangeGoal ?? 0,
                GoalWeight = model.GoalWeight ?? 0
            };

            _logger.LogInformation("Attempting to register user with email {Email}", model.Email);
            var result = await _userManager.CreateAsync(user, model.Password);
            if (!result.Succeeded)
            {
                _logger.LogWarning("User creation failed for {Email}. Errors: {Errors}", model.Email, string.Join(';', result.Errors.Select(e => $"{e.Code}:{e.Description}")));
                return BadRequest(result.Errors);
            }

            // Initialize DailyCaloriesGoal based on provided data
            await _userService.RecalculateDailyCaloriesAsync(user.Id);
            _logger.LogInformation("Recalculated daily calories for user {UserId}", user.Id);

            // Await email send with safe error handling in dev to diagnose issues
            try
            {
                await _emailService.SendRegistrationConfirmationEmailAsync(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send registration email to {Email}", user.Email);
            }

            return Ok();
        }

        [HttpPost(LoginHttpAttributeName)]
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
            var refreshToken = _tokenService.GenerateRefreshToken(model.IpAddress ?? HttpContext.Connection.RemoteIpAddress?.ToString());
            refreshToken.UserId = user.Id;

            await _tokenService.SaveRefreshTokenAsync(refreshToken);

            var response = new AuthResponse
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken.Token
            };

            return Ok(response);
        }

        [HttpPost(LogoutHttpAttributeName)]
        public async Task<IActionResult> Logout([FromBody] LogoutRequest request)
        {
            if (string.IsNullOrEmpty(request.RefreshToken))
            {
                return BadRequest(new { Message = RefreshTokenRequiredError });
            }

            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
            var result = await _tokenService.RevokeRefreshTokenAsync(request.RefreshToken, ipAddress);

            if (!result)
            {
                return BadRequest(new { Message = InvalidRefreshTokenError });
            }

            return Ok(new { Message = LogoutSuccessful });
        }

        [HttpPost(RefreshTokenHttpAttributeName)]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
        {
            if (string.IsNullOrEmpty(request.RefreshToken))
            {
                return BadRequest(new { Message = RefreshTokenRequiredError });
            }

            var ipAddress = request.IpAddress ?? HttpContext.Connection.RemoteIpAddress?.ToString();
            var refreshToken = await _tokenService.GetRefreshTokenAsync(request.RefreshToken);

            if (refreshToken == null || !refreshToken.IsActive)
            {
                return BadRequest(new { Message = InvalidRefreshTokenError });
            }

            var user = await _userService.FindUserByIdAsync(refreshToken.UserId);
            if (user == null)
            {
                return BadRequest(new { Message = UserNotFoundError });
            }

            var newAccessToken = _tokenService.GenerateToken(user);
            var newRefreshToken = _tokenService.GenerateRefreshToken(ipAddress);
            newRefreshToken.UserId = user.Id;

            refreshToken.Revoked = DateTime.UtcNow;
            refreshToken.RevokedByIp = ipAddress;
            refreshToken.ReplacedByToken = newRefreshToken.Token;
            
            await _tokenService.SaveRefreshTokenAsync(newRefreshToken);
            await _tokenService.UpdateRefreshTokenAsync(refreshToken);

            return Ok(new AuthResponse
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken.Token
            });
        }
    }
}
