﻿namespace Fitness_Tracker.Controllers
{
    using Fitness_Tracker.Data;
    using Fitness_Tracker.Data.Models;
    using Fitness_Tracker.Models.Users;
    using Fitness_Tracker.Services.Tokens;
    using Fitness_Tracker.Services.Users;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Mvc;

    using static Constants.AuthController;


    public class AuthController : BaseApiController
    {
        private readonly UserManager<User> _userManager;
        private readonly ITokenService _tokenService;
        private readonly IUserService _userService;

        public AuthController(UserManager<User> userManager, ITokenService tokenService, IUserService userService)
        {
            _userManager = userManager;
            _tokenService = tokenService;
            _userService = userService;
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
                return BadRequest("Refresh token is required.");
            }

            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();

            var result = await _tokenService.RevokeRefreshTokenAsync(request.RefreshToken, ipAddress);

            if (!result)
            {
                return BadRequest("Invalid or already revoked token.");
            }

            return Ok("Logged out successfully.");
        }

    }
}
