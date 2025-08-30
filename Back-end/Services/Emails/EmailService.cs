namespace Fitness_Tracker.Services.Emails
{
    using Fitness_Tracker.Data.Models;
    using Microsoft.Extensions.Options;
    using Microsoft.Extensions.Logging;
    using System.Net;
    using System.Net.Mail;
    using System.Threading.Tasks;

    public class EmailService : IEmailService
    {
        private readonly EmailSettings _settings;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IOptions<EmailSettings> options, ILogger<EmailService> logger)
        {
            _settings = options.Value;
            _logger = logger;
        }

        public async Task SendRegistrationConfirmationEmailAsync(User user)
        {
            if (string.IsNullOrWhiteSpace(user?.Email))
            {
                _logger.LogWarning("Attempted to send registration email but user email was empty or null. UserId: {UserId}", user?.Id);
                return;
            }

            _logger.LogInformation("Preparing to send registration email. To: {ToEmail}, Host: {Host}, Port: {Port}, SSL: {SSL}, From: {FromEmail}", user.Email, _settings.SmtpHost, _settings.SmtpPort, _settings.EnableSsl, _settings.FromEmail);
            System.Net.ServicePointManager.SecurityProtocol = System.Net.SecurityProtocolType.Tls12;

            using var client = new SmtpClient(_settings.SmtpHost, _settings.SmtpPort);
            client.EnableSsl = _settings.EnableSsl;
            client.DeliveryMethod = SmtpDeliveryMethod.Network;
            client.Timeout = 15000; // 15s
            client.UseDefaultCredentials = false;
            if (!string.IsNullOrWhiteSpace(_settings.Username))
            {
                client.Credentials = new NetworkCredential(_settings.Username, _settings.Password);
            }

            var from = new MailAddress(_settings.FromEmail, _settings.FromName);
            var to = new MailAddress(user.Email, user.FullName ?? user.Email);
            using var message = new MailMessage(from, to)
            {
                Subject = "Welcome to Fitness Tracker",
                Body = $"Hello {user.FullName ?? user.Email},\n\nYour account has been successfully registered. If this wasn't you, please contact support.",
                IsBodyHtml = false
            };

            try
            {
                await client.SendMailAsync(message);
                _logger.LogInformation("Registration email sent successfully to {ToEmail}", user.Email);
            }
            catch (SmtpException smtpEx)
            {
                _logger.LogError(smtpEx, "SMTP error while sending registration email to {ToEmail}. StatusCode: {StatusCode}", user.Email, smtpEx.StatusCode);
                throw;
            }
            catch (System.Security.Authentication.AuthenticationException authEx)
            {
                _logger.LogError(authEx, "Authentication error while connecting to SMTP server {Host}:{Port} with username {Username}", _settings.SmtpHost, _settings.SmtpPort, MaskUsername(_settings.Username));
                throw;
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while sending registration email to {ToEmail}", user.Email);
                throw;
            }
        }

        public async Task SendPasswordResetEmailAsync(User user, string appLink, string webLink)
        {
            if (string.IsNullOrWhiteSpace(user?.Email))
            {
                _logger.LogWarning("Attempted to send password reset email but user email was empty or null. UserId: {UserId}", user?.Id);
                return;
            }

            _logger.LogInformation("Preparing to send password reset email. To: {ToEmail}", user.Email);
            System.Net.ServicePointManager.SecurityProtocol = System.Net.SecurityProtocolType.Tls12;

            using var client = new SmtpClient(_settings.SmtpHost, _settings.SmtpPort);
            client.EnableSsl = _settings.EnableSsl;
            client.DeliveryMethod = SmtpDeliveryMethod.Network;
            client.Timeout = 15000;
            client.UseDefaultCredentials = false;
            if (!string.IsNullOrWhiteSpace(_settings.Username))
            {
                client.Credentials = new NetworkCredential(_settings.Username, _settings.Password);
            }

            var from = new MailAddress(_settings.FromEmail, _settings.FromName);
            var to = new MailAddress(user.Email, user.FullName ?? user.Email);
            var body = $@"<html><body style='font-family:Arial,sans-serif'>
<p>Hello {System.Net.WebUtility.HtmlEncode(user.FullName ?? user.Email)},</p>
<p>We received a request to reset your password. You can use the following links:</p>
<p><a href='{System.Net.WebUtility.HtmlEncode(appLink)}'>Open in the app</a></p>
<p>If the app doesn't open, use the web link below:</p>
<p><a href='{System.Net.WebUtility.HtmlEncode(webLink)}'>{System.Net.WebUtility.HtmlEncode(webLink)}</a></p>
<p>If you did not request this, you can safely ignore this email.</p>
</body></html>";

            using var message = new MailMessage(from, to)
            {
                Subject = "Reset your Fitness Tracker password",
                Body = body,
                IsBodyHtml = true
            };

            try
            {
                await client.SendMailAsync(message);
                _logger.LogInformation("Password reset email sent successfully to {ToEmail}", user.Email);
            }
            catch (SmtpException smtpEx)
            {
                _logger.LogError(smtpEx, "SMTP error while sending password reset email to {ToEmail}. StatusCode: {StatusCode}", user.Email, smtpEx.StatusCode);
                throw;
            }
            catch (System.Security.Authentication.AuthenticationException authEx)
            {
                _logger.LogError(authEx, "Authentication error while connecting to SMTP server {Host}:{Port} with username {Username}", _settings.SmtpHost, _settings.SmtpPort, MaskUsername(_settings.Username));
                throw;
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while sending password reset email to {ToEmail}", user.Email);
                throw;
            }
        }

        private static string MaskUsername(string username)
        {
            if (string.IsNullOrEmpty(username)) return string.Empty;
            var atIndex = username.IndexOf('@');
            if (atIndex <= 1) return "***";
            return username.Substring(0, 1) + new string('*', atIndex - 2) + username.Substring(atIndex - 1);
        }
    }
}


