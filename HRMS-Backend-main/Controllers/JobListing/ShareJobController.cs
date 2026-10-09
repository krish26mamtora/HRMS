using HRMS_Backend.Data;
using HRMS_Backend.Entities;
using HRMS_Backend.Entities.JobListing;
using HRMS_Backend.Model.JobListing;
using HRMS_Backend.Services.Email;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HRMS_Backend.Controllers.JobListing
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ShareJobController : ControllerBase
    {
       private readonly IEmailService _emailService;
        private readonly MyDbContext _context;
        public ShareJobController(IEmailService emailService,MyDbContext context) {
            _emailService = emailService;
            _context = context;
        }

        [Authorize(Roles = "Employee")]
        [HttpPost]
        public async Task<IActionResult> ShareJob([FromForm] ShareMailCreateUpdateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var job = await _context.Jobs.FindAsync(dto.JobId);
            if (job == null)
            {
                return NotFound("Job Not Found");
            }

            var sahre = new ShareEmail
            {
                JobId = dto.JobId,
                ReceiverMail = dto.ReceiverMail,
                EmpId = dto.EmpId,
                Subject = dto.Subject,
                Message = dto.Message,
                AttachedFileName = dto.JobDescriptionPdf?.FileName,
                CreatedAt = DateTime.UtcNow,
            };

            _context.ShareEmail.Add(sahre);
            await _context.SaveChangesAsync();

            var body = $@"
                  <h2> Job Opportunity : {job.Title}</h2>
                   <p>{dto.Message}</p>   
                        <br/>
                        <p>Experiance Required {job.ExpYearsReq}</p>
                          <p>Role :  {job.Role}</p>
                          <p>Description :  {job.Description}</p>
                          <p>Contact Mail :  {job.ContactMail}</p>
                            
            ";
            await _emailService.SendEmailAsync(
                dto.ReceiverMail,
                string.IsNullOrEmpty(dto.Subject) ? "Job Opportunity" : dto.Subject,
                body,
                dto.JobDescriptionPdf
            );

            return Ok(new { message = "Email send successfully!" });
        }

    }
}

