using HRMS_Backend.Data;
using HRMS_Backend.Entities;
using HRMS_Backend.Entities.FixEntityUserProfile;
using HRMS_Backend.Model;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace HRMS_Backend.Services
{
    public class AuthService : IAuthService
    {
        private readonly IConfiguration configuration;
        private readonly MyDbContext context;
        public AuthService(IConfiguration configuration, MyDbContext context)
        {
            this.configuration = configuration;
            this.context = context;
        }

        private async Task<string> GenerateAndSaveRefreshToken(User user)
        {
            var randomNumber = new byte[32];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            var refreshToken = Convert.ToBase64String(randomNumber);
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(1);
            await context.SaveChangesAsync();
            return refreshToken;
        }

        private string CreateToken(User user)
        {
            var claims = new List<Claim>
            {
                //new Claim(ClaimTypes.Name , user.Username),
                new Claim(ClaimTypes.Name , user.Email),
                 new Claim(ClaimTypes.NameIdentifier , user.Id.ToString()),
                  new Claim(ClaimTypes.Role , user.Role),
            };
            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(configuration.GetValue<string>("AppSettings:Token")!));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512);

            var tokenDescriptor = new JwtSecurityToken(
                issuer: configuration.GetValue<string>("AppSettings:Issuer"),
                audience: configuration.GetValue<string>("AppSettings:Audience"),
                claims: claims,
                expires: DateTime.UtcNow.AddDays(1),
                signingCredentials: creds
                );
            return new JwtSecurityTokenHandler().WriteToken(tokenDescriptor);
        }
        public async Task<User?> RegisterAsync(UserDto request)
        {
            //if (await context.Users.AnyAsync(u => u.Username == request.Username))
            if (await context.Users.AnyAsync(u => u.Email == request.Email))
            {
                return null;
            }
            //var user = new User();

            //user.Email = request.Email;
            var user = new User
            {
                Email = request.Email,
                Role = "Employee",                           
                UserProfile = new UserProfile
                {
                    FirstName = "New",
                    LastName = "User",
                    JoinDate = DateTime.UtcNow,
                    IsActive = true,
                    ManagerId = 1
                }
            };
            user.PasswordHash = new PasswordHasher<User>()
                .HashPassword(user, request.Password);
      
            await context.Users.AddAsync(user);
            await context.SaveChangesAsync();
            return (user);
        }

        public async Task<TokenResponseDto?> LoginAsync(UserDto request)
        {
            User? user = await context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user is null)
            {
                return null;
            }
            if (new PasswordHasher<User>().VerifyHashedPassword(user, user.PasswordHash, request.Password) == PasswordVerificationResult.Failed)
            {
                return null;
            }
            var token = new TokenResponseDto
            {
                AccessToken = CreateToken(user),
                RefreshToken = await GenerateAndSaveRefreshToken(user),
                Role = user.Role,
                Id = user.Id.ToString(),
            };
            return token;
        }

        public async Task<TokenResponseDto?> RefreshTokenAsync(RefreshTokenRequestDto request)
        {
            var user = await context.Users.FindAsync(request.userId);
            if (user is null || user.RefreshToken != request.RefreshToken
                || user.RefreshTokenExpiry < DateTime.UtcNow
                )
            {
                return null;
            }
            var token = new TokenResponseDto
            {
                AccessToken = CreateToken(user),
                RefreshToken = await GenerateAndSaveRefreshToken(user)
            };
            return token;
        }
    }
}
