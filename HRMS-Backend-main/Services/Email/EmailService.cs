
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace HRMS_Backend.Services.Email
{
    public class EmailService : IEmailService
    {
        private readonly string smtpServer;
        private readonly int port;
        private readonly string senderName;
        private readonly string senderEmail;
        private readonly string username;
        private readonly string appPassword;

        public EmailService(IConfiguration configuration)
        {
            smtpServer = configuration["EmailSettings:Host"]
                ?? throw new InvalidOperationException(
                    "EmailSettings:Host is missing from configuration.");

            if (!int.TryParse(configuration["EmailSettings:Port"], out port))
            {
                throw new InvalidOperationException(
                    "EmailSettings:Port is missing or invalid.");
            }

            senderName = configuration["EmailSettings:DisplayName"]
                ?? throw new InvalidOperationException(
                    "EmailSettings:DisplayName is missing.");

            senderEmail = configuration["EmailSettings:FromEmail"]
                ?? throw new InvalidOperationException(
                    "EmailSettings:FromEmail is missing.");

            username = configuration["EmailSettings:Username"]
                ?? throw new InvalidOperationException(
                    "EmailSettings:Username is missing.");

            appPassword = configuration["EmailSettings:Password"]
                ?? throw new InvalidOperationException(
                    "EmailSettings:Password is missing.");
        }

        public async Task SendEmailAsync(
            string toEmail,
            string subject,
            string message,
            IFormFile? attachment = null)
        {
            var email = new MimeMessage();

            email.From.Add(new MailboxAddress(senderName, senderEmail));
            email.To.Add(MailboxAddress.Parse(toEmail));
            email.Subject = subject;

            var builder = new BodyBuilder
            {
                HtmlBody = message
            };

            if (attachment != null)
            {
                using var ms = new MemoryStream();
                await attachment.CopyToAsync(ms);

                builder.Attachments.Add(
                    attachment.FileName,
                    ms.ToArray());
            }

            email.Body = builder.ToMessageBody();

            using var smtp = new SmtpClient();

            // Diagnostic workaround for the revocation-check failure.
            // Keep normal certificate validation enabled.
            smtp.CheckCertificateRevocation = false;

            await smtp.ConnectAsync(
                smtpServer,
                port,
                SecureSocketOptions.StartTls);

            await smtp.AuthenticateAsync(username, appPassword);
            await smtp.SendAsync(email);
            await smtp.DisconnectAsync(true);
        }
    }
}
