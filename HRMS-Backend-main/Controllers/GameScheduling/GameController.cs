using HRMS_Backend.Services.GameScheduling;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace HRMS_Backend.Controllers.GameScheduling
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class GameController : ControllerBase
    {
        private readonly IGamesService _service;
        public GameController(IGamesService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult?> GetAllGamesAsync()
        {
            var games = await _service.GetAllGamesAsync();
            if (games == null)
            {
                return BadRequest(ModelState);
            }
            return Ok(games);

        }

    }
}
