using HRMS_Backend.Model.GameScheduling;
using HRMS_Backend.Services.GameScheduling;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRMS_Backend.Controllers.GameScheduling
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class BookingController : ControllerBase
    {
        private readonly IBookingService _service;
        public  BookingController(IBookingService service)
        {
            _service = service;
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
            catch (Exception ex)
            {
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