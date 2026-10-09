namespace HRMS_Backend.Services.Email
{
    public interface IEmailService
    {
        public Task SendEmailAsync(string toEmail, string subject, string message , IFormFile? attachment = null);
    }
}
