namespace Fitness_Tracker.Services.Emails
{
    using System.Threading.Tasks;
    using Fitness_Tracker.Data.Models;

    public interface IEmailService
    {
        Task SendRegistrationConfirmationEmailAsync(User user);
        Task SendPasswordResetEmailAsync(User user, string appLink, string webLink);
    }
}


