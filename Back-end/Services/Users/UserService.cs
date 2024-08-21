namespace Fitness_Tracker.Services.Users
{
    using Fitness_Tracker.Data.Models;
    using Microsoft.AspNetCore.Identity;
    using System.Threading.Tasks;

    public class UserService : IUserService
    {
        private readonly UserManager<User> _userManager;

        public UserService(UserManager<User> userManager)
        {
            this._userManager = userManager;
        }

        public async Task<User> FindUserByEmailAsync(string userEmail)
        {
            return await _userManager.FindByEmailAsync(userEmail);
        }
        public async Task<User> FindUserByIdAsync(string userId)
        {
            return await _userManager.FindByIdAsync(userId);
        }
        public async Task<bool> CheckUserAndPasswordMatchAsync(User user, string userPassword)
        {
            return await _userManager.CheckPasswordAsync(user, userPassword);
        }

        public async Task<IdentityResult> CreateUserAsync(User user, string userPassword)
        {
            return await _userManager.CreateAsync(user, userPassword);
        }
    }
}
