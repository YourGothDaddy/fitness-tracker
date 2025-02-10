namespace Fitness_Tracker.Services.Tokens
{
    using Fitness_Tracker.Data.Models;

    public interface ITokenService
    {
        public string GenerateToken(User user);
    }
}
