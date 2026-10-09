using HRMS_Backend.Services.GameScheduling;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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
    }
}
