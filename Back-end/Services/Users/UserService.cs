namespace Fitness_Tracker.Services.Users
{
    using Microsoft.AspNetCore.Identity;
    using System.Threading.Tasks;

    public class UserService : IUserService
    {
        private readonly UserManager<IdentityUser> _userManager;

        public UserService(UserManager<IdentityUser> userManager)
        {
            this._userManager = userManager;
        }

        public async Task<IdentityUser> FindUserByEmailAsync(string userEmail)
        {
            return await _userManager.FindByEmailAsync(userEmail);
        }
        public async Task<IdentityUser> FindUserByIdAsync(string userId)
        {
            return await _userManager.FindByIdAsync(userId);
        }
        public async Task<bool> CheckUserAndPasswordMatch(IdentityUser user, string userPassword)
        {
            return await _userManager.CheckPasswordAsync(user, userPassword);
        }

        public async Task<IdentityResult> CreateUserAsync(IdentityUser user, string userPassword)
        {
            return await _userManager.CreateAsync(user, userPassword);
        }
    }
}
