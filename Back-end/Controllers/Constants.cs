namespace Fitness_Tracker.Controllers
{
    public class Constants
    {
        public static class User
        {
            public const string RegisterHttpAttributeName = "register";
            public const string LoginHttpAttributeName = "login";
            public const string LogoutHttpAttributeName = "logout";
            public const string AuthStatusHttpAttributeName = "authstatus";
            public const string ProfileHttpAttributeName = "profile";
            public const string ChangeProfileInfoHttpAttributeName = "change-profile-info";
            public const string GoalsInfoHttpAttributeName = "goals";
            public const string ChangeGoalsInfoHttpAttributeName = "change-goals-and-data-info";
        }

        public static class Meal
        {
            public const string AddMealHttpAttributeName = "add-meal";
        }
    }
}
