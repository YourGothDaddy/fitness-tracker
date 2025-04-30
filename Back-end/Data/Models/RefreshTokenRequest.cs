namespace Fitness_Tracker.Data.Models
{
    public class RefreshTokenRequest
    {
        public string RefreshToken { get; set; } = null!;
        public string? IpAddress { get; set; }
    }
} 