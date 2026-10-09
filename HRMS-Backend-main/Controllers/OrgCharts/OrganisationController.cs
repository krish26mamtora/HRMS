using HRMS_Backend.Data;
using HRMS_Backend.Entities;
using HRMS_Backend.Entities.FixEntityUserProfile;
using HRMS_Backend.Services.TravelandExpenses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HRMS_Backend.Controllers.OrgCharts
{
    [Authorize]

    [Route("api/[controller]")]
    [ApiController]

    public class OrganisationController  : ControllerBase
    {
        private readonly ITravelExpenseService _service;
        private readonly MyDbContext _context;

        public OrganisationController(MyDbContext context)
        {
            _context = context;
        }
        [HttpGet("{employeeId}")]
        public async Task<ActionResult<List<UserProfile>>> GetManagerRecursive(int employeeId)
        {
            var allManagers = new List<UserProfile>();
            var currentEmployee = await _context.UserProfile.FindAsync(employeeId);
            if (currentEmployee == null)
            {
                return NotFound();
            }
            allManagers.Add(currentEmployee);
            int? currentManagerId = currentEmployee.ManagerId;

            while (currentManagerId.HasValue)
            {
                if (currentManagerId == allManagers.Last().UserProfileId)
                {
                    break;
                }
                var manager = await _context.UserProfile.FindAsync(currentManagerId.Value);
                if (manager == null) break;

                allManagers.Add(manager);
                currentManagerId = manager.ManagerId; 
            }

            return Ok(allManagers);
        }
        [HttpGet("direct-reports/{employeeId}")]
        public async Task<ActionResult<List<UserProfile>>> GetEmployeeList(int employeeId)
        {
            if (employeeId <= 0)
            {
                return BadRequest("Invalid Employee ID.");
            }
            var allEmp = await _context.UserProfile.Where(up => up.ManagerId == employeeId).ToListAsync();

            return Ok(allEmp);
        }
    }
}

