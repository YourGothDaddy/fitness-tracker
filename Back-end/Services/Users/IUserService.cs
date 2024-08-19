namespace Fitness_Tracker.Services.Users
{
    using Microsoft.AspNetCore.Identity;

    public interface IUserService
    {
        public Task<IdentityUser> FindUserByEmailAsync(string userEmail);
        public Task<IdentityUser> FindUserByIdAsync(string userId);
        public Task<bool> CheckUserAndPasswordMatch(IdentityUser user, string userPassword);
        public Task<IdentityResult> CreateUserAsync(IdentityUser user, string userPassword);
    }
}
