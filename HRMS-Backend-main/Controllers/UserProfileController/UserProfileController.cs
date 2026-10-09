using HRMS_Backend.Entities.JobListing;
using HRMS_Backend.Model;
using HRMS_Backend.Model.DtoUserProfile;
using HRMS_Backend.Services.ServiceUserProfile;
using HRMS_Backend.Services.TravelandExpenses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRMS_Backend.Controllers.UserProfileController
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class UserProfileController : ControllerBase
    {

        private readonly IUserProfileService _service;

        public UserProfileController(IUserProfileService service)
        {
            _service = service;
        }
        [HttpGet]
        public async Task<ActionResult> GetAllUsers()
        {
            var users = await _service.GetAllUsersAsync();
            return Ok(users);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult> GetUserById(int id)
        {
            var user = await _service.GetUserByIdAsync(id);
            if (user == null)
            {
                return NotFound();
            }
            return Ok(user);
        }

        [HttpGet("team/{id}", Name = "GetUsersByManagerIdAsync")]
        public async Task<ActionResult> GetUsersByManagerIdAsync(int id)
        {
            var users = await _service.GetUsersByManagerIdAsync(id);
            return Ok(users);
        }
        [HttpPost]
        public async Task<ActionResult> CreateuserProfile([FromBody] UserProfileCreateUpdateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var createProfile = await _service.CreateUserAsync(dto);
            return CreatedAtAction(nameof(GetUserById), new { id = createProfile.UserProfileId }, createProfile);
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUserProfile(int id, [FromBody] UserProfileCreateUpdateDto dto)
        {
            if(!ModelState.IsValid)
            { 
                return BadRequest(ModelState); 
            }

            var result = await _service.UpdateUserAsync(id, dto);

            if (!result)
            {
                return NotFound(new { message = "Could not update profile." });
            }

            return Ok(new { message = "Profile updated successfully!!!!" });
        }
        [HttpGet("getusetemailfromId/{id}")]
        public async Task<IActionResult> GetUserEmailfromId(int id)
        {
            var email = await _service.getUserEmailfromId(id);

            if (string.IsNullOrEmpty(email))
            {
                return NotFound(new { message = "Email address not found for this employee." });
            }
            return Ok(new { email });
        }
    }
}
