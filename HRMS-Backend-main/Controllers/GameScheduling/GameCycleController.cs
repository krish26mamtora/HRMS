using HRMS_Backend.Model.GameScheduling;
using HRMS_Backend.Services.GameScheduling;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRMS_Backend.Controllers.GameScheduling
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class GameCycleController : ControllerBase
    {
        private readonly IGameCycleService _gameCycleService;
        public GameCycleController(  IGameCycleService gameCycleService)
        {
            _gameCycleService = gameCycleService;
        }

        [HttpPost]
        [Authorize(Roles = "HR")]
        public async Task<IActionResult> CreateGameCycleAsync([FromBody] GameCycleCreateUpdateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                var CreateCycle = await _gameCycleService.CreateGameCycleAsync(dto);
                return CreatedAtAction(nameof(getCycleById), new { id = CreateCycle.CycleId }, CreateCycle);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet("{id}", Name = "getCycleById")]
        public async Task<IActionResult> getCycleById(int id)
        {
            var Expense = await _gameCycleService.getCycleById(id);
            if (Expense == null)
            {
                return BadRequest(ModelState);
            }
            return Ok(Expense);
        }



    }
}
