using HRMS_Backend.Entities;
using HRMS_Backend.Model;
using HRMS_Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using RouteAttribute = Microsoft.AspNetCore.Mvc.RouteAttribute;

namespace HRMS_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration configuration;
        private readonly IAuthService service;

        public AuthController(IAuthService service) {
            this.service = service;
        }

        [HttpPost("register")]
        public async Task<ActionResult<User?>> Register(UserDto request)
        {
            var user = await  service.RegisterAsync(request);
            if(user is null)
            {
                return BadRequest(new { message = "Email already exists" });
            }
            return Ok(new
            {
                email = user.Email,
                message = "Registration successful"
            });
        }

        [HttpPost("login")]
        public async Task<ActionResult<TokenResponseDto?>> Login(UserDto request)
        {
            var token = await service.LoginAsync(request);
            if (token is null) {
                return BadRequest("Username/Password is wrong");
            }
           
            return Ok(token);
        }

        [HttpPost("refresh-token")]
        public async Task<ActionResult<TokenResponseDto>> RefreshToken(RefreshTokenRequestDto request)
        {
            var token = await service.RefreshTokenAsync(request);
            if (token is null)
            {
                return BadRequest("Invlid/expired token");
            }

            return Ok(token);
        }

        [HttpGet("Auth-endpoint")]
        [Authorize]

        public ActionResult AuthCheck()
        {
            return Ok();
        }
        [HttpGet("Admin-endpoint")]
        [Authorize(Roles = "Admin")]

        public ActionResult AdminCheck()
        {
            return Ok();
        }
    }
}
