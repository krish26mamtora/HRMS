using HRMS_Backend.Entities;
using HRMS_Backend.Model;

namespace HRMS_Backend.Services
{
    public interface IAuthService
    {
        Task<TokenResponseDto?> LoginAsync(UserDto request);
        Task<User?> RegisterAsync(UserDto request);

        Task<TokenResponseDto?> RefreshTokenAsync(RefreshTokenRequestDto request);
    }
}