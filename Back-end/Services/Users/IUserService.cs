namespace Fitness_Tracker.Services.Users
{
    using Fitness_Tracker.Data.Models;
    using Microsoft.AspNetCore.Identity;

    public interface IUserService
    {
        public Task<User> FindUserByEmailAsync(string userEmail);
        public Task<User> FindUserByIdAsync(string userId);
        public Task<bool> CheckUserAndPasswordMatchAsync(User user, string userPassword);
        public Task<IdentityResult> CreateUserAsync(User user, string userPassword);

        public Task UpdateUserAsync(User user);
    }
}
