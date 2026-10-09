using HRMS_Backend.Model.TravelandExpense;
using HRMS_Backend.Services.TravelandExpenses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRMS_Backend.Controllers.TravelandExpense
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class TravelPlanController :ControllerBase
    { 
        private readonly ITravelPlanService _service;

        public TravelPlanController(ITravelPlanService service)
        {
            _service = service;
        }

        [HttpPost]
        [Authorize(Roles = "HR")]
        public async  Task<ActionResult> CreateTravelPlan([FromBody] TravelCreateUpdateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                var CreatePlan = await _service.CreateTravelPlanAsync(dto);
                return Ok(CreatePlan);
            }
            catch (Exception ex) { 
                return BadRequest(ex.Message);
            }
        }
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var plans = await _service.GetAllPlansAsync();
            if (plans == null || !plans.Any())
            {
                return NotFound("No plans found");
            }
            return Ok(plans);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var plans = await _service.GetPlanByIdAsync(id);
            if (plans == null)
            {
                return NotFound("No plans found");
            }
            return Ok(plans);
        }
        //[HttpGet("employee/{id}", Name = "GetPlanByUserId")]
        //public async Task<IActionResult> GetPlanByUserId(int id)
        //{
        //    var plans = await _service.GetPlanByIdAsync(id);
        //    if (plans == null)
        //    {
        //        return NotFound("No plans found");
        //    }
        //    return Ok(plans);
        //}
        [HttpDelete("{id}")]
        [Authorize(Roles = "HR")]
        public async Task<IActionResult> DeletePlanById(int id)
        {
            var result = await _service.DeletePlanById(id);
            if (!result)
            {
                return NotFound("no plan found");
            }
            return NoContent();
        }


        [HttpPut("{id}")]
        [Authorize(Roles = "HR")]
        public async Task<IActionResult> UpdatePlanById(int id , [FromBody] TravelCreateUpdateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var result = await _service.UpdatePlanById(id, dto);
            if (!result)
            {
                return NotFound("Plan not found");
            }
            return Ok("Plan updated successfully");
        }

        [HttpGet("date/{id}")]
       public async Task<IActionResult> GetToDate(int id)
        {
            if (id <= 0)
                return BadRequest("Invalid ID");
            DateTime? result = await _service.GetToDate(id);
            if (!result.HasValue)
            {
                return NotFound("Plan not found");
            }
            return Ok(result);
        }
    }
}
