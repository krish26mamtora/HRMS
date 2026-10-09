using HRMS_Backend.Data;
using HRMS_Backend.Entities.TravelandExpense;
using HRMS_Backend.Model.TravelandExpense;
using HRMS_Backend.Services.Email;
using HRMS_Backend.Services.TravelandExpenses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HRMS_Backend.Controllers.TravelandExpense
{
    [Route("api/[controller]")]
    [ApiController]
    public class ExpenseController : ControllerBase
    {
        private readonly ITravelExpenseService _service;
        private readonly IEmailService _emailService;
        private readonly MyDbContext _context;
        public ExpenseController(ITravelExpenseService service, IEmailService emailservice, MyDbContext context)
        {
            _service = service;
            _emailService = emailservice;
            _context = context;
        }

        [HttpPost]
        public async Task<ActionResult> CreateTravelExpense([FromBody] ExpenseCreateUpdateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                var CreateExpense = await _service.CreateTravelExpenseAsync(dto);
                return CreatedAtAction(nameof(getExpenseById), new { id = CreateExpense.Id }, CreateExpense);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An internal error occurred." });
            }

        }
        [HttpGet("{id}", Name = "getExpenseById")]
        public async Task<IActionResult> getExpenseById(int id)
        {
            var Expense = await _service.GetExpenseByIdAsync(id);
            if (Expense == null)
            {
                return BadRequest(ModelState);
            }
            return Ok(Expense);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var Expenses = await _service.GetAllExpenseAsync();
            if (Expenses == null || !Expenses.Any())
            {
                return NotFound("No Explense found");
            }
            return Ok(Expenses);
        }

        [HttpGet("travelassign/{id}", Name = "GetExpenseByTravelAssignmentId")]
        public async Task<IActionResult> GetExpenseByTravelAssignmentId(int id)
        {
            var Expense = await _service.getExpensesByTravelAssignedId(id);
            if (Expense == null)
            {
                return BadRequest(ModelState);
            }
            return Ok(Expense);
        }

        [HttpGet("getId")]
        public async Task<IActionResult> GetAssignPlanIdfromEmpIdandPId([FromQuery(Name = "EmpId")] int EmpId, [FromQuery(Name = "PId")] int PId)

        {
            var rowId = await _service.GetIdfromEmpIDandPID(EmpId, PId);
            if (rowId == null)
            {
                return NotFound(new { message = "No record found for the given EmpId and PId." });
            }
            return Ok(rowId);
        }

        [HttpGet("getExpensesByTravelAssignedId/{id}", Name = "getExpensesByTravelAssignedId")]

        public async Task<IActionResult> getExpensesByTravelAssignedId(int id)
        {
            var response = await _service.getExpensesByTravelAssignedId(id);
            if (response == null)
            {
                return NotFound(new { message = "No record found for the given Travel AssignId." });
            }
            return Ok(response);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "HR")]
        public async Task<IActionResult> UpdateExpenseByIdAsync([FromBody] ExpenseCreateUpdateDto dto, int id)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var result = await _service.UpdateExpenseByIdAsync(dto, id);
            if (!result)
            {
                return NotFound("Expense not found");
            }
            return Ok("Expense updated successfully");
        }

        [HttpPost("notifyExpenseCreate/", Name = "NotifyExpenseCreate")]
        public async Task<IActionResult> NotifyForExpenseClaim([FromBody] ExpenseEmailCreateUpdateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var expense = await _context.TravelExpense.FindAsync(dto.TravelExpenseId);
            if (expense == null)
            {
                return NotFound("Travel Expense record not found.");
            }
            var expenseEmail = new ExpenseCreateEmail
            {
                TravelExpenseId = dto.TravelExpenseId,
                RecipientEmail = dto.RecipientEmail,
                SenderId = dto.SenderId,
                Subject = dto.Subject,
                Body = dto.Body,
                ExpenseDate = dto.ExpenseDate,
                Status = "Sent",
                CreatedAt = DateTime.UtcNow,
                SentAt = DateTime.UtcNow
            };
            _context.ExpenseCreateEmail.Add(expenseEmail);
            await _context.SaveChangesAsync();
            var emailHtmlBody = $@"
            <h2>Expense Claim Notification</h2>
            <p><strong>Message:</strong> {dto.Body}</p>
            <hr/>
            <p><strong>Expense ID:</strong> {expense.Id}</p>
            <p><strong>Amount:</strong> {expense.Amount}</p>
            <p><strong>Date:</strong> {expense.ExpenseDate}</p>
            <p><strong>Category:</strong> {expense.ExpenseType}</p>
            <br/>
            <h3>Please log in to the HRMS portal to review or approve this claim.</h3> ";

            await _emailService.SendEmailAsync(
               dto.RecipientEmail,
               expenseEmail.Subject,
               emailHtmlBody
             );
            return Ok(new { message = "Expense notification sent successfully!", id = expenseEmail.Id });
        }

    }
}
