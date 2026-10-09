using HRMS_Backend.Data;
using HRMS_Backend.Entities.JobListing;
using HRMS_Backend.Model.JobListing;
using HRMS_Backend.Model.TravelandExpense;
using HRMS_Backend.Services.Email;
using HRMS_Backend.Services.JobListing;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
namespace HRMS_Backend.Controllers.JobListing
{
    [Authorize]

    [Route("api/[controller]")]
    [ApiController]
    public class ReferalController : ControllerBase
    {
        private readonly IReferService _service;
        private readonly MyDbContext _context;
        private readonly IEmailService _emailService;
        public ReferalController(IReferService service , MyDbContext context , IEmailService emailService)
        {
            _service = service;
            _context = context;
            _emailService = emailService;
        }
        [Authorize(Roles = "Employee")]
        [HttpPost]
        public async Task<IActionResult?> CreateReferalAsync([FromForm] JobRefferalCreateUpdateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            string uniqueFileName = string.Empty;
            if (dto.ReffResume != null)
            {
                var allowedExtensions = new[] { ".pdf", ".doc", ".docx" };
                var extension = Path.GetExtension(dto.ReffResume.FileName).ToLowerInvariant();
                if (string.IsNullOrEmpty(extension) || !allowedExtensions.Contains(extension))
                {
                    return BadRequest("Invalid file type. Only PDF and Word documents are allowed.");
                }
            }
            var createjob = await _service.createReferalAsync(dto);
            if (dto.ReceiverEmails != null)
            {
                var job = await _context.Jobs.FindAsync(dto.JobId);
                

            var body = $@"
                <h2>New Referral: {dto.ReffName}</h2>
                <p><strong>Job Title:</strong> {job?.Title}</p>
                <p><strong>Role:</strong> {job?.Role}</p>
                <p><strong>Experience Required:</strong> {job?.ExpYearsReq}</p>
                <p><strong>Candidate Email:</strong> {dto.ReffMail}</p>
                <p><strong>Referral Note:</strong> {dto.Description}</p>
                <br/>
                <p>Please find the candidate's resume attached to this email.</p>";

                foreach (var email in dto.ReceiverEmails)
                {
                    await _emailService.SendEmailAsync(
                        email,
                        $"Referral: {dto.ReffName} for {job?.Title}",
                        body,
                        dto.ReffResume 
                    );
                }
            }
            return Ok(new
            {
                id = createjob.Id,
                message = "Referral created and emails sent successfully"
            });            
            //return CreatedAtAction(nameof(getReferalById), new { id = createjob.Id }, createjob);
        }


        [HttpGet("{id}", Name = "getReferalById")]
        public async Task<IActionResult> getReferalById(int id)
        {
            var referal = await _service.getReferalById(id);
            if (referal == null)
            {
                return BadRequest(ModelState);
            }
            return Ok(referal);
        }

        [HttpGet("job/{id}", Name = "getReferalByJobId")]
        public async Task<IActionResult> getReferalByJobId(int id)
        {
            var referal = await  _service.getReferalByJobId(id);
            if (referal == null)
            {
                return BadRequest(ModelState);
            }
            return Ok(referal);
        }

        [HttpGet("user/{id}", Name = "getReferalByUserId")]
        public async Task<IActionResult> getReferalByUserId(int id)
        {
            var referal =await  _service.getReferalByUserId(id);
            if (referal == null)
            {
                return BadRequest(ModelState);
            }
            return Ok(referal);
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateReferalById(int id, [FromBody] JobRefferalCreateUpdateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var result = await _service.UpdateReferalWithId(id, dto);
            if (!result)
            {
                return NotFound("Plan not found");
            }
            return Ok("Plan updated successfully");
        }
    }
}
