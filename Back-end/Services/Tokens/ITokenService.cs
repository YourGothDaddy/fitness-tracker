namespace Fitness_Tracker.Services.Tokens
{
    using Fitness_Tracker.Data.Models;

    public interface ITokenService
    {
        public string GenerateToken(User user);
        RefreshToken GenerateRefreshToken(string ipAddress);

        Task SaveRefreshTokenAsync(RefreshToken refreshToken);

        Task<bool> RevokeRefreshTokenAsync(string refreshToken, string ipAddress);
    }
}
