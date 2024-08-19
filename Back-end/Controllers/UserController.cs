namespace Fitness_Tracker.Controllers
{
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
            IdentityUser userInExistence = await _userService.FindUserByEmailAsync(model.Email);
            bool userExists = userInExistence != null;
            if (!userExists)
            {
                IdentityUser user = new IdentityUser { UserName = model.Email, Email = model.Email };
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
            IdentityUser user = await _userService.FindUserByEmailAsync(model.Email);
            bool userAndPasswordMatch = await _userService.CheckUserAndPasswordMatch(user, model.Password);

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
            string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userId == null)
            {
                return Unauthorized();
            }

            IdentityUser user = await _userService.FindUserByIdAsync(userId);

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

        // PRIVATE METHODS
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

        private string CreateJWT(IdentityUser? user)
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
