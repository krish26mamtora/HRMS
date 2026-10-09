using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using System.Net;
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
            smtpServer = configuration["SmtpSettings:SmtpServer"];
            port = int.Parse(configuration["SmtpSettings:Port"]);
            senderName = configuration["SmtpSettings:SenderName"];
            senderEmail = configuration["SmtpSettings:SenderEmail"];
            username = configuration["SmtpSettings:Username"];
            appPassword = configuration["SmtpSettings:AppPassword"];
        }


            public async Task SendEmailAsync (string toEmail , string subject , string message , IFormFile? attachment = null)
        {
            var email = new MimeMessage();
            email.From.Add(new MailboxAddress(senderName, senderEmail));
            email.To.Add( MailboxAddress.Parse(toEmail));
            email.Subject = subject;

            //email.Body = new TextPart("html")
            //{
            //    Text = message
            //};
            var builder = new BodyBuilder
            {
                HtmlBody = message
            };

            if (attachment != null)
            {
                using (var ms = new MemoryStream())
                {
                    await attachment.CopyToAsync(ms);
                    builder.Attachments.Add(attachment.FileName, ms.ToArray());
                }
            }

            email.Body = builder.ToMessageBody();
            using var smtp = new SmtpClient();
            await smtp.ConnectAsync(smtpServer, port , SecureSocketOptions.StartTls);
            await smtp.AuthenticateAsync(username , appPassword);
            await smtp.SendAsync(email);
            await smtp.DisconnectAsync(true);
            }
        
        }
    }
//}
