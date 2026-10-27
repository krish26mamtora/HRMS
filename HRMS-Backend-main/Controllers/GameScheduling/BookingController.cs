using HRMS_Backend.Model.GameScheduling;
using HRMS_Backend.Services.GameScheduling;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HRMS_Backend.Controllers.GameScheduling
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class BookingController : ControllerBase
    {
        private readonly IBookingService _service;
        private readonly ILogger<BookingController> _logger;
        public BookingController(IBookingService service, ILogger<BookingController> logger)
        {
            _service = service;
            _logger = logger;
        }
        [HttpPost]
        public async Task<IActionResult> RequestBookingAsync([FromBody] BookingRequestCreateDto dto)
        {
            if (dto == null)
            {
                return BadRequest("Request body cannot be null");
            }
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                var BookingResult = await _service.RequestBookingAsync(dto);
                return Ok(BookingResult);
                //return CreatedAtAction(nameof(getBookingById), new { id = CreateBooking.BId }, CreateBooking);
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Failed to save booking request for slot {SlotId}", dto.SlotId);
                return Conflict(new
                {
                    message = "The database rejected this booking request. Refresh the slot and try again. If the problem continues, contact support."
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to process booking request for slot {SlotId}", dto.SlotId);
                return BadRequest(ex.Message);
            }
        }
        [HttpGet("{id}", Name = "getBookingById")]
        public async Task<IActionResult> getBookingById(int id)
        {
            var booking = await _service.getBookingById(id);
            if (booking == null)
            {
                return  NotFound();
            }
            return Ok(booking);
        }
        [HttpGet("user/{id}" , Name ="getUserBookings")]
        public async Task<IActionResult> getBookingsByUserId(int id)
        {
            var bookings = await _service.getBookingsByUserId(id);
            if(bookings == null)
            {
                return BadRequest(ModelState);
            }
            return Ok(bookings);
        }

       
        [HttpPut("cancel/{bookingId}", Name = "CancelBooking")]
        public async Task<IActionResult> CancelBooking(int bookingId)
        {
            if (bookingId <= 0)
            {
                return BadRequest("Invalid booking ID.");
            }
            try
            {
                await _service.CancelBookingAsync(bookingId);
                return Ok(new
                {
                    Success = true,
                    Message = "Booking Cancelled Successfully , waiting queue updated"
                }); 
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = ex.Message,
                });
            }
           
        }

        [HttpPost("slot/{slotId}/complete")]
        public async Task<IActionResult> CompleteSlot(int slotId)
        {
            try
            {
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(userIdClaim))
                    return Unauthorized();

                int completedByUserId = int.Parse(userIdClaim);

                await _service.MarkSlotCompletedAsync(slotId, completedByUserId);

                return Ok(new { message = "Slot marked as completed successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
        [AllowAnonymous]
        [HttpGet("respond")] 
        public async Task<IActionResult> Respond([FromQuery] string token, [FromQuery] bool accept)
        {
            if (string.IsNullOrEmpty(token))
            {
                return BadRequest("Invalid invitation token.");
            }
            var resultMessage = await _service.ProcessInviteResponseAsync(token, accept);
            return Ok(new { message = resultMessage });
        }
    }
}