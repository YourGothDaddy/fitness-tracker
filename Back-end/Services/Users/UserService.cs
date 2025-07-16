namespace Fitness_Tracker.Services.Users
{
    using Fitness_Tracker.Data;
    using Fitness_Tracker.Data.Models;
    using Fitness_Tracker.Models.Users;
    using Microsoft.AspNetCore.Identity;
    using System.Threading.Tasks;
    using System;
    using Fitness_Tracker.Data.Models.Enums;

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

        public async Task<ProfileModel> GetProfileDataAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return null;
            }

            var bmi = await CalculateBMIAsync(user.Weight, user.Height);
            var bodyFat = await CalculateBodyFatAsync(user.Weight, user.Height, user.Age, user.Gender.ToString());

            return new ProfileModel
            {
                FullName = user.FullName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                Age = user.Age,
                Sex = user.Gender.ToString(),
                Weight = user.Weight,
                Height = user.Height,
                BMI = bmi,
                BodyFat = bodyFat
            };
        }

        public async Task<IdentityResult> UpdateProfileDataAsync(string userId, ProfileModel model)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return IdentityResult.Failed(new IdentityError { Description = "User not found" });
            }

            user.FullName = model.FullName;
            user.PhoneNumber = model.PhoneNumber;
            user.Age = model.Age;
            user.Gender = (Gender)Enum.Parse(typeof(Gender), model.Sex);
            user.Weight = model.Weight;
            user.Height = model.Height;

            return await _userManager.UpdateAsync(user);
        }

        public async Task<float> CalculateBMIAsync(float weight, float height)
        {
            if (height <= 0 || weight <= 0)
            {
                return 0;
            }

            float heightInMeters = height / 100;
            return weight / (heightInMeters * heightInMeters);
        }

        public async Task<float> CalculateBodyFatAsync(float weight, float height, int age, string sex)
        {
            if (height <= 0 || weight <= 0 || age <= 0)
            {
                return 0;
            }

            float bmi = await CalculateBMIAsync(weight, height);
            float bodyFat;

            if (sex.ToLower() == "male")
            {
                bodyFat = (1.20f * bmi) + (0.23f * age) - 16.2f;
            }
            else
            {
                bodyFat = (1.20f * bmi) + (0.23f * age) - 5.4f;
            }

            return Math.Max(0, Math.Min(100, bodyFat));
        }

        public async Task<UpdateGoalsModel> GetUserGoalsAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                throw new InvalidOperationException("User not found");
            }

            return new UpdateGoalsModel
            {
                DailyCaloriesGoal = user.DailyCaloriesGoal,
                DailyProteinGoal = user.DailyProteinGoal
            };
        }

        public async Task<IdentityResult> UpdateUserGoalsAsync(string userId, UpdateGoalsModel model)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                throw new InvalidOperationException("User not found");
            }

            user.DailyCaloriesGoal = model.DailyCaloriesGoal;
            user.DailyProteinGoal = model.DailyProteinGoal;

            return await _userManager.UpdateAsync(user);
        }

        public async Task<MacroSettingsModel> GetMacroSettingsAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                throw new InvalidOperationException("User not found");

            var macroMode = (int)user.MacroMode;
            var totalKcal = user.DailyCaloriesGoal > 0 ? user.DailyCaloriesGoal : 2000;
            return new MacroSettingsModel
            {
                MacroMode = macroMode,
                TotalKcal = totalKcal,
                ProteinRatio = user.ProteinRatio,
                CarbsRatio = user.CarbsRatio,
                FatRatio = user.FatRatio,
                ProteinKcal = user.ProteinKcal,
                CarbsKcal = user.CarbsKcal,
                FatKcal = user.FatKcal
            };
        }

        public async Task UpdateMacroSettingsAsync(string userId, MacroSettingsModel model)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                throw new InvalidOperationException("User not found");

            user.MacroMode = (Fitness_Tracker.Data.Models.Enums.MacroMode)model.MacroMode;
            if (model.TotalKcal > 0)
                user.DailyCaloriesGoal = model.TotalKcal;

            if (user.MacroMode == Fitness_Tracker.Data.Models.Enums.MacroMode.Ratios)
            {
                user.ProteinRatio = model.ProteinRatio ?? 30;
                user.CarbsRatio = model.CarbsRatio ?? 40;
                user.FatRatio = model.FatRatio ?? 30;
                user.ProteinKcal = 0;
                user.CarbsKcal = 0;
                user.FatKcal = 0;
            }
            else
            {
                user.ProteinKcal = model.ProteinKcal ?? 0;
                user.CarbsKcal = model.CarbsKcal ?? 0;
                user.FatKcal = model.FatKcal ?? 0;
                user.ProteinRatio = 0;
                user.CarbsRatio = 0;
                user.FatRatio = 0;
            }
            await _userManager.UpdateAsync(user);
        }

        public async Task UpdateUserAvatarAsync(string userId, string avatarUrl)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                throw new InvalidOperationException("User not found");
            }
            user.AvatarUrl = avatarUrl;
            await _userManager.UpdateAsync(user);
        }
    }
}
