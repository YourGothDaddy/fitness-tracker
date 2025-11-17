namespace Fitness_Tracker.Controllers
{
    public class Constants
    {
        public static class UserController
        {
            public const string RegisterHttpAttributeName = "register";
            public const string LoginHttpAttributeName = "login";
            public const string LogoutHttpAttributeName = "logout";
            public const string AuthStatusHttpAttributeName = "authstatus";
            public const string ProfileHttpAttributeName = "profile";
            public const string ChangeProfileInfoHttpAttributeName = "change-profile-info";
            public const string GoalsInfoHttpAttributeName = "goals";
            public const string ChangeGoalsInfoHttpAttributeName = "change-goals-and-data-info";

            public const string UserExistsError = "User with this email already exists!";
            public const string EmailIsEmptyErrorOrNull = "The provided email is empty or null!";
            public const string EmailIsAlreadyInUse = "Email is already in use.";
        }

        public static class AuthController
        {
            public const string RegisterHttpAttributeName = "register";
            public const string LoginHttpAttributeName = "login";
            public const string LogoutHttpAttributeName = "logout";
            public const string RefreshTokenHttpAttributeName = "refresh-token";
            public const string ForgotPasswordHttpAttributeName = "forgot-password";
            public const string ResetPasswordHttpAttributeName = "reset-password";
            public const string OpenResetPasswordHttpAttributeName = "open-reset-password";

            public const string UserExistsError = "User with this email already exists!";
            public const string RefreshTokenRequiredError = "Refresh token is required.";
            public const string InvalidRefreshTokenError = "Invalid or expired refresh token.";
            public const string UserNotFoundError = "User not found.";
            public const string LogoutSuccessful = "Logged out successfully.";
        }

        public static class MealController
        {
            public const string AddMealHttpAttributeName = "add-meal";
            public const string AllMealsHttpAttributeName = "all";
            public const string AllMealsCaloriesHttpAttributeName = "calories";
            public const string GetAllMealsHttpAttributeName = "all-meals";
            public const string DeleteMealHttpAttributeName = "delete/{id}";
            public const string UpdateMealHttpAttributeName = "update/{id}";

            public const string InvalidModelStateError = "Invalid meal data provided.";
            public const string MealAddedSuccessfully = "Meal added successfully.";
            public const string MealUpdatedSuccessfully = "Meal updated successfully.";
        }

        public static class AdminController
        {
            public const string AddConsumableItemHttpAttributeName = "add-consumable-item";
            public const string AddActivityCategoryHttpAttributeName = "add-activity-category";
            public const string AddActivityTypeHttpAttributeName = "add-activity-type";
            public const string GetActivityCategoriesHttpAttributeName = "get-activity-categories";

            public const string InvalidModelStateError = "Invalid data provided.";

            public const string ConsumableItemAddedSuccessfully = "Consumable item added successfully.";
            public const string ConsumableItemExists = "Consumable item exists already!";

            public const string ActivityCategoryAddedSuccessfully = "Activity category added successfully.";
            public const string ActivityCategoryExists = "This activity category exists already!";

            public const string ActivityTypeAddedSuccessfully = "Activity type added successfully.";
            public const string ActivityTypeExists = "This activity type exists already!";
        }

        public static class ConsumableController
        {
            public const string SearchConsumableItemHttpAttributeName = "search";
        }

        public static class General
        {
            public const string UserIsNotAuthenticatedError = "User is not authenticated.";
        }

        public static class NutritionController
        {
            public const string DailyCaloriesHttpAttributeName = "daily-calories";
        }
        
        public static class ActivityController
        {
            public const string ActivityOverviewHttpAttributeName = "activity-overview";
            public const string ActivityOverviewForPeriodHttpAttributeName = "activity-overview-period";
        }
    }
}
