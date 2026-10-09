using HRMS_Backend.Data;
using HRMS_Backend.Entities.Games_Scheduling;
using HRMS_Backend.Entities.JobListing;
using HRMS_Backend.Model.GameScheduling;
using HRMS_Backend.Services.GameScheduling;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HRMS_Backend.Controllers.GameScheduling
{
    [Authorize(Roles ="HR")]
    [Route("api/[controller]")]
    [ApiController]
    public class GameConfigController : ControllerBase
    {

        private readonly IGameConfigService _service;
        private readonly MyDbContext _context;
        public GameConfigController(IGameConfigService service , MyDbContext context) {
            _service = service;
            _context = context;
        }
        [HttpPost]
        public async Task<IActionResult> CreateGameConfig([FromBody] GameConfigCreateUpdateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var createConfig = await _service.AddGameConfigurationAsync(dto);
            return CreatedAtAction(nameof(getGameConfigById), new { id = createConfig.Id }, createConfig);

        }

        [HttpGet("{id}", Name = "getGameConfigById")]
        public async Task<IActionResult> getGameConfigById(int id)
        {
            var GameConfig = await _service.getGameConfigByIdAsync(id);
            if (GameConfig == null)
            {
                return BadRequest(ModelState);
            }
            return Ok(GameConfig);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllConfigAsync()
        {
            var gameConfig = await _service.GetAllConfigAsync();
            if (gameConfig == null || !gameConfig.Any())
            {
                return NotFound("No Config found");
            }
            return Ok(gameConfig);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateGameConfig(int id, [FromBody] GameConfigCreateUpdateDto dto)
        {
            if(!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var result = await _service.UpdateGameConfigurationAsync(id, dto);
            if(!result)
            {
                return NotFound($"Configuration with id {id} not found");
            }

            return Ok(new { message = "Game configuration updated successfully" });
        }

    }
}
