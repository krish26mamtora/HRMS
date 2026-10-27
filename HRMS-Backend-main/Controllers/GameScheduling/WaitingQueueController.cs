using HRMS_Backend.Services.GameScheduling;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HRMS_Backend.Controllers.GameScheduling
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class WaitingQueueController : ControllerBase
    {
        private readonly IWaitingQueueService _waitingQueueService;
        public WaitingQueueController(IWaitingQueueService waitingQueueService)
        {
            _waitingQueueService = waitingQueueService;
        }
        [HttpGet("user/{id}", Name = "getWaitingListByUserId")]
        public async Task<IActionResult> getWaitingListByUserId(int id)
        {
            var waitingqueue = await _waitingQueueService.GetWaitingQueueByPlayerId(id);
            if (waitingqueue == null)
            {
                return BadRequest(ModelState);
            }
            return Ok(waitingqueue);
        }

        [HttpDelete("{queueId}")]
        public async Task<IActionResult> CancelWaitingEntry(int queueId)
        {
            if (queueId <= 0)
            {
                return BadRequest("Invalid waiting queue entry ID.");
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            var removed = await _waitingQueueService.CancelWaitingEntryAsync(queueId, userId);
            if (!removed)
            {
                return NotFound(new { message = "Waiting entry was not found or is no longer waiting." });
            }

            return Ok(new { message = "Waiting queue entry cancelled." });
        }
    }
}
