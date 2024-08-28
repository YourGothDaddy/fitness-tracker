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

        public static class MealController
        {
            public const string AddMealHttpAttributeName = "add-meal";
            public const string AllMealsHttpAttributeName = "all";
            public const string AllMealsCaloriesHttpAttributeName = "calories";

            public const string InvalidModelStateError = "Invalid meal data provided.";
            public const string UserIsNotAuthenticatedError = "User is not authenticated.";
            public const string MealAddedSuccessfully = "Meal added successfully.";
        }
    }
}
