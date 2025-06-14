﻿namespace Fitness_Tracker.Services.Users
{
    using Fitness_Tracker.Data.Models;
    using Fitness_Tracker.Models.Users;
    using Microsoft.AspNetCore.Identity;

    public interface IUserService
    {
        public Task<User> FindUserByEmailAsync(string userEmail);
        public Task<User> FindUserByIdAsync(string userId);
        public Task<bool> CheckUserAndPasswordMatchAsync(User user, string userPassword);
        public Task<IdentityResult> CreateUserAsync(User user, string userPassword);
        public Task UpdateUserAsync(User user);

        public Task<IList<string>> GetUserRolesAsync(User userId);
        
        // New methods for account management
        public Task<IdentityResult> UpdateProfileAsync(User user, UpdateProfileModel model);
        public Task<IdentityResult> ChangePasswordAsync(User user, string currentPassword, string newPassword);
        public Task<bool> UpdateNotificationsAsync(User user, bool notificationsEnabled);
        public Task<User> GetUserProfileAsync(string userId);
    }
}
