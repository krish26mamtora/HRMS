using HRMS_Backend.Model.JobListing;
using HRMS_Backend.Model.TravelandExpense;
using HRMS_Backend.Services.TravelandExpenses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRMS_Backend.Controllers.TravelandExpense
{

    [Route("api/[controller]")]
    [ApiController]

    public class ExpenseProofController : ControllerBase
    {
        private readonly IWebHostEnvironment _hostingEnvironment;
        private readonly IExpenseProofService _service;
        public ExpenseProofController(IWebHostEnvironment hostingEnvironment , IExpenseProofService service)
        {
            _hostingEnvironment = hostingEnvironment;
            _service = service;
        }
        [HttpGet("download-expense-proof/{filename}")]
        public async Task<IActionResult> getExpenseProof(string fileName)
        {
            string filePath = Path.Combine(_hostingEnvironment.ContentRootPath, "UploadedExpenseProof", fileName);
            if (!System.IO.File.Exists(filePath)) return NotFound();
            var fileBytes = await System.IO.File.ReadAllBytesAsync(filePath);
            return File(fileBytes, "application/pdf", fileName);
        }

        [HttpPost]
        [Authorize(Roles = "Employee")]
        public async Task<IActionResult?> createExpenseProofAsync([FromForm]  ExpenseProofCreateUpdateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            string uniqueFileName = string.Empty;
            if (dto.ProofDocument == null)
            {
                return BadRequest("Proof document is MUST!!!");
            }
             var allowedExtensions = new[] { ".pdf", ".doc", ".docx" };
            var extension = Path.GetExtension(dto.ProofDocument.FileName).ToLowerInvariant();
             if (string.IsNullOrEmpty(extension) || !allowedExtensions.Contains(extension))
             {
                  return BadRequest("Invalid file type. Only PDF and Word documents are allowed.");
             }
            
            var expenseProof = await _service.createExpenseProofAsync(dto);
            return CreatedAtAction(nameof(getExpenseProofById), new { id = expenseProof.Id }, expenseProof);
        }

        [HttpGet("getExpenseProofById/{id}")]
        public async Task<IActionResult> getExpenseProofById(int id)
        {
            var expenseproof = await _service.getExpenseProofById(id);
            if (expenseproof == null)
            {
                return BadRequest(ModelState);
            }
            return Ok(expenseproof);
        }

        [HttpGet("getExpenseProofForExpenseid/{id}")]
        public async Task<IActionResult> getExpenseProofByExpenseId(int id)
        {
            var expenseproof = await _service.getExpenseProofByExpenseId(id);
            if (expenseproof == null)
            {
                return BadRequest(ModelState);
            }
            return Ok(expenseproof);
        }
    }
}
