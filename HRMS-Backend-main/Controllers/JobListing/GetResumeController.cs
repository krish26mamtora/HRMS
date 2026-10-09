using AutoMapper;
using HRMS_Backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRMS_Backend.Controllers.JobListing
{
    //[Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class GetResumeController : ControllerBase
    {
     
        private readonly IWebHostEnvironment _hostingEnvironment;
        public GetResumeController(IWebHostEnvironment hostingEnvironment)
        {
            _hostingEnvironment = hostingEnvironment;
        }

        [HttpGet("download-resume/{fileName}")]
        public async Task<IActionResult> GetResume(string fileName)
        {
            string filePath = Path.Combine(_hostingEnvironment.ContentRootPath, "UploadedResumes", fileName);
            if (!System.IO.File.Exists(filePath)) return NotFound();
            var fileBytes = await System.IO.File.ReadAllBytesAsync(filePath);
            return File(fileBytes, "application/pdf", fileName);

        }

    }
}
