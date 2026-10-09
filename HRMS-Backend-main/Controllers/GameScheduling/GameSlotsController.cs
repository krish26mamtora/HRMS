using HRMS_Backend.Entities.Games_Scheduling;
using HRMS_Backend.Model.GameScheduling;
using HRMS_Backend.Services.GameScheduling;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRMS_Backend.Controllers.GameScheduling
{

    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class GameSlotsController : ControllerBase
    {
        private readonly IGameSlotService _service;
        public GameSlotsController(IGameSlotService service)
        {
            _service = service;
        }

        [HttpPost("{GamesId}")]
        public async Task<int?> GenerateGameSlotAsync(int GamesId)
        {
            DateOnly today = DateOnly.FromDateTime(DateTime.Now);
           return await _service.GenerateGameSlotAsync(GamesId , today);
        }

        [HttpGet]
        public async Task<IActionResult?> GetAllGamesSlotAsync()
        {
            var games = await _service.GetAllGamesSlotAsync();
            if (games == null)
            {
                return BadRequest(ModelState);
            }
            return Ok(games);

        }
        [HttpGet("slots")]
        public async Task<IActionResult?> GetGamesSlotForGameAndDateAsync([FromQuery] int id,[FromQuery] DateTime dt)
        {
            var slots = await _service.GetGamesSlotForGameAndDateAsync(id , dt);
            if (slots == null)
            {
                return NotFound("No slots found");
            }
            return Ok(slots);
        }

    }
}
