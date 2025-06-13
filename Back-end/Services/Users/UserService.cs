namespace Fitness_Tracker.Services.Users
{
    using Fitness_Tracker.Data;
    using Fitness_Tracker.Data.Models;
    using Fitness_Tracker.Models.Users;
    using Microsoft.AspNetCore.Identity;
    using System.Threading.Tasks;

    public class UserService : IUserService
    {
        private readonly UserManager<User> _userManager;
        private readonly ApplicationDbContext _databaseContext;

        public UserService(
            UserManager<User> userManager,
            ApplicationDbContext databaseContext)
        {
            this._userManager = userManager;
            this._databaseContext = databaseContext;
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

        public async Task UpdateUserAsync(User user)
        {
            this._databaseContext.Users.Update(user);
            await this._databaseContext.SaveChangesAsync();
        }

        public async Task<IList<string>> GetUserRolesAsync(User user)
        {
            return await _userManager.GetRolesAsync(user);
        }

        public async Task<IdentityResult> UpdateProfileAsync(User user, UpdateProfileModel model)
        {
            user.FullName = model.FullName;
            user.Email = model.Email;
            user.UserName = model.Email;
            user.PhoneNumber = model.PhoneNumber;

            return await _userManager.UpdateAsync(user);
        }

        public async Task<IdentityResult> ChangePasswordAsync(User user, string currentPassword, string newPassword)
        {
            return await _userManager.ChangePasswordAsync(user, currentPassword, newPassword);
        }

        public async Task<bool> UpdateNotificationsAsync(User user, bool notificationsEnabled)
        {
            user.NotificationsEnabled = notificationsEnabled;
            var result = await _userManager.UpdateAsync(user);
            return result.Succeeded;
        }

        public async Task<User> GetUserProfileAsync(string userId)
        {
            return await _userManager.FindByIdAsync(userId);
        }
    }
}
