using HRMS_Backend.Entities.JobListing;
using HRMS_Backend.Model.JobListing;
using HRMS_Backend.Services.JobListing;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace HRMS_Backend.Controllers.JobListing
{
    //[Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class jobListingController : ControllerBase
    {
        private readonly IJobService service;
        private readonly IWebHostEnvironment _hostingEnvironment;

        public jobListingController(IJobService jobsService , IWebHostEnvironment hostingEnvironment) { 
            service = jobsService;
            _hostingEnvironment = hostingEnvironment;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var jobs = await service.GetAllJobsAsync();
            return Ok(jobs);
        }


        [HttpGet("{id}", Name = "GetJobById")]
        public async Task<IActionResult> GetJobById(int id)
        {
            var job = await service.GetJobByIdAsync(id);
            if (job == null)
            {
                return NotFound();
            }
            return Ok(job);
        }

        [HttpGet("downloadJD/{filename}")]
        public async Task<IActionResult> getJD(string fileName)
        {
            string filePath = Path.Combine(_hostingEnvironment.ContentRootPath, "JD", fileName);
            if (!System.IO.File.Exists(filePath)) return NotFound();
            var fileBytes = await System.IO.File.ReadAllBytesAsync(filePath);
            return File(fileBytes, "application/pdf", fileName);
        }

        [Authorize(Roles = "HR")]
        [HttpPost]
        public async Task<IActionResult> CreateJob([FromForm] JobCreateUpdateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            string uniqueFileName = string.Empty;
            if (dto.JdUrl == null)
            {
                return BadRequest("Job Description is MUST!!!");
            }
            var allowedExtensions = new[] { ".pdf", ".doc", ".docx" };
            var extension = Path.GetExtension(dto.JdUrl.FileName).ToLowerInvariant();
            if (string.IsNullOrEmpty(extension) || !allowedExtensions.Contains(extension))
            {
                return BadRequest("Invalid file type. Only PDF and Word documents are allowed.");
            }
            var createjob = await service.CreateJobAsync(dto);
            return CreatedAtAction(nameof(GetJobById), new { id = createjob.Id }, createjob);
        }

    }
}
