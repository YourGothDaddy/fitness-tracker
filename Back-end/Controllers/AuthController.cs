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
    using Microsoft.AspNetCore.WebUtilities;
    using System.Text;

    public class AuthController : BaseApiController
    {
        private readonly UserManager<User> _userManager;
        private readonly ITokenService _tokenService;
        private readonly IUserService _userService;
        private readonly IEmailService _emailService;
        private readonly ILogger<AuthController> _logger;
        private readonly IConfiguration _configuration;

        public AuthController(UserManager<User> userManager, ITokenService tokenService, IUserService userService, IEmailService emailService, ILogger<AuthController> logger, IConfiguration configuration)
        {
            _userManager = userManager;
            _tokenService = tokenService;
            _userService = userService;
            _emailService = emailService;
            _logger = logger;
            _configuration = configuration;
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

        [HttpPost(ForgotPasswordHttpAttributeName)]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _userService.FindUserByEmailAsync(model.Email);

            // To prevent account enumeration, always respond OK
            if (user == null)
            {
                return Ok();
            }

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var tokenBytes = Encoding.UTF8.GetBytes(token);
            var tokenEncoded = WebEncoders.Base64UrlEncode(tokenBytes);

            var request = HttpContext.Request;
            var origin = $"{request.Scheme}://{request.Host}";
            var publicBaseUrl = _configuration["App:PublicBaseUrl"];
            var baseUrl = string.IsNullOrWhiteSpace(publicBaseUrl) ? origin : publicBaseUrl.TrimEnd('/');

            var webLink = $"{baseUrl}/api/auth/reset-password?email={Uri.EscapeDataString(user.Email)}&token={tokenEncoded}";
            var appDeepLink = $"fitness-tracker://reset-password?email={Uri.EscapeDataString(user.Email)}&token={tokenEncoded}";
            var launcherLink = $"{baseUrl}/api/auth/open-reset-password?email={Uri.EscapeDataString(user.Email)}&token={tokenEncoded}";

            try
            {
                await _emailService.SendPasswordResetEmailAsync(user, launcherLink, webLink);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send password reset email to {Email}", user.Email);
                // Still return OK to avoid enumeration
            }

            return Ok();
        }

        [HttpPost(ResetPasswordHttpAttributeName)]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _userService.FindUserByEmailAsync(model.Email);
            if (user == null)
            {
                // Do not reveal that the user does not exist
                return Ok();
            }

            string decodedToken;
            try
            {
                var tokenBytes = WebEncoders.Base64UrlDecode(model.Token);
                decodedToken = Encoding.UTF8.GetString(tokenBytes);
            }
            catch
            {
                return BadRequest(new { Message = "Invalid token." });
            }

            var result = await _userManager.ResetPasswordAsync(user, decodedToken, model.NewPassword);
            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            return Ok(new { Message = "Password has been reset successfully." });
        }

        [HttpGet(ResetPasswordHttpAttributeName)]
        public IActionResult ResetPasswordPage([FromQuery] string email, [FromQuery] string token)
        {
            string emailValue = System.Net.WebUtility.HtmlEncode(email ?? string.Empty);
            string tokenValue = System.Net.WebUtility.HtmlEncode(token ?? string.Empty);

            var htmlTemplate = @"<!DOCTYPE html>
<html lang=""en"">
  <head>
    <meta charset=""UTF-8"" />
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"" />
    <title>Reset Password</title>
    <style>
      body {{ font-family: Arial, sans-serif; margin: 40px; background:#f7f7f7; }}
      .card {{ max-width:420px; margin:0 auto; background:#fff; padding:24px; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.1); }}
      h1 {{ font-size:20px; margin-top:0; }}
      label {{ display:block; margin:12px 0 6px; font-weight:600; }}
      input {{ width:100%; padding:10px; border:1px solid #ccc; border-radius:6px; }}
      button {{ margin-top:16px; width:100%; padding:12px; background:#2e7d32; color:#fff; border:none; border-radius:6px; cursor:pointer; font-weight:700; }}
      .msg {{ margin-top:12px; }}
      .err {{ color:#c62828; }}
      .ok {{ color:#2e7d32; }}
    </style>
  </head>
  <body>
    <div class=""card"">
      <h1>Set a new password</h1>
      <div id=""message"" class=""msg""></div>
      <form id=""resetForm"">
        <input type=""hidden"" id=""email"" value=""%%EMAIL%%"" />
        <input type=""hidden"" id=""token"" value=""%%TOKEN%%"" />
        <label for=""password"">New password</label>
        <input type=""password"" id=""password"" required minlength=""6"" />
        <label for=""confirm"">Confirm password</label>
        <input type=""password"" id=""confirm"" required minlength=""6"" />
        <button type=""submit"">Reset Password</button>
      </form>
    </div>
    <script>
      const form = document.getElementById('resetForm');
      const msg = document.getElementById('message');
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        msg.textContent = '';
        const email = document.getElementById('email').value;
        const token = document.getElementById('token').value;
        const password = document.getElementById('password').value;
        const confirm = document.getElementById('confirm').value;
        if (password !== confirm) {
          msg.className = 'msg err';
          msg.textContent = 'Passwords do not match.';
          return;
        }
        try {
          const res = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, token, newPassword: password })
          });
          if (!res.ok) {
            const err = await res.text();
            throw new Error(err || 'Failed to reset password');
          }
          msg.className = 'msg ok';
          msg.textContent = 'Password reset successful. You can close this page.';
          form.reset();
        } catch (error) {
          msg.className = 'msg err';
          msg.textContent = 'Failed to reset password. The link may be invalid or expired.';
        }
      });
    </script>
  </body>
</html>";

            var html = htmlTemplate.Replace("%%EMAIL%%", emailValue).Replace("%%TOKEN%%", tokenValue);
            return Content(html, "text/html; charset=UTF-8");
        }

        [HttpGet(OpenResetPasswordHttpAttributeName)]
        public IActionResult OpenResetPassword([FromQuery] string email, [FromQuery] string token)
        {
            // This endpoint is an HTTPS link for email clients like Gmail.
            // It attempts to open the app via custom scheme; if that fails, falls back to web page.
            var publicBaseUrl = _configuration["App:PublicBaseUrl"];
            var request = HttpContext.Request;
            var origin = $"{request.Scheme}://{request.Host}";
            var baseUrl = string.IsNullOrWhiteSpace(publicBaseUrl) ? origin : publicBaseUrl.TrimEnd('/');

            var appLink = $"fitness-tracker://reset-password?email={Uri.EscapeDataString(email ?? string.Empty)}&token={Uri.EscapeDataString(token ?? string.Empty)}";
            var webLink = $"{baseUrl}/api/auth/reset-password?email={Uri.EscapeDataString(email ?? string.Empty)}&token={Uri.EscapeDataString(token ?? string.Empty)}";

            var html = @"<!DOCTYPE html>
<html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'>
<title>Opening Fitlicious…</title>
<style>body{font-family:Arial,sans-serif;margin:40px;color:#1b5e20}</style>
</head><body>
<p>Opening the app… If nothing happens, <a id='fallback' href='" + System.Net.WebUtility.HtmlEncode(webLink) + @"'>tap here</a>.</p>
<script>
  (function(){
    var appUrl = '" + System.Net.WebUtility.HtmlEncode(appLink) + @"';
    var fallbackUrl = document.getElementById('fallback').href;
    var now = Date.now();
    var timeout = setTimeout(function(){ window.location.href = fallbackUrl; }, 1800);
    window.location.href = appUrl;
  })();
  </script>
</body></html>";

            return Content(html, "text/html; charset=UTF-8");
        }
    }
}
