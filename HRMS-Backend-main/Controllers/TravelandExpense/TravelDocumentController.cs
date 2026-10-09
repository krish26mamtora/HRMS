using HRMS_Backend.Model.TravelandExpense;
using HRMS_Backend.Services.TravelandExpenses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRMS_Backend.Controllers.TravelandExpense
{
    //[Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class TravelDocumentController : ControllerBase
    {
        private readonly ITravelDocumentsService _service;
        private readonly IWebHostEnvironment _hostingEnvironment;

        public TravelDocumentController(ITravelDocumentsService service, IWebHostEnvironment hostingEnvironment)
        {
            _service = service;
            _hostingEnvironment = hostingEnvironment;
        }
        [HttpGet("download-travel-document/{filename}")]
        public async Task<IActionResult> getExpenseProof(string fileName)
        {
            string filePath = Path.Combine(_hostingEnvironment.ContentRootPath, "TravelDocuments", fileName);
            if (!System.IO.File.Exists(filePath)) return NotFound();
            var fileBytes = await System.IO.File.ReadAllBytesAsync(filePath);
            return File(fileBytes, "application/pdf", fileName);
        }

        [HttpPost]
        [Authorize(Roles = "Employee,HR")]
        public async Task<IActionResult> uploadTravelDocument([FromForm] TravelDocumentsCreateUpdateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            string uniqueFileName = string.Empty;
            if (dto.TravelDocument != null)
            {
                var allowedExtensions = new[] { ".pdf", ".doc", ".docx" };
                var extension = Path.GetExtension(dto.TravelDocument.FileName).ToLowerInvariant();
                if (string.IsNullOrEmpty(extension) || !allowedExtensions.Contains(extension))
                {
                    return BadRequest("Invalid file type. Only PDF and Word documents are allowed.");
                }
            }
            var traveldocument = await _service.uploadTravelDocument(dto);
            return CreatedAtAction(nameof(getDocumentsByTravelDocumentId), new { id = traveldocument.Id }, traveldocument);
        }

        [HttpGet("{id}", Name = "getDocumentsByTravelDocumentId")]
        public async Task<IActionResult> getDocumentsByTravelDocumentId(int id)
        {
            var travelDocument = await _service.getDocumentsByTravelDocumentId(id);
            if (travelDocument == null)
            {
                return BadRequest(ModelState);
            }
            return Ok(travelDocument);
        }

        [HttpGet("travelassignDocs/{id}", Name = "getDocumentsByTravelAssignedId")]
        public async Task<IActionResult> getDocumentsByTravelAssignedId(int id)
        {
            var Expense = await _service.getDocumentsByTravelAssignedId(id);
            if (Expense == null)
            {
                return BadRequest(ModelState);
            }
            return Ok(Expense);
        }

    }
}
