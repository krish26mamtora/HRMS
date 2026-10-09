using HRMS_Backend.Model.DtoUserProfile;

namespace HRMS_Backend.Services.ServiceUserProfile
{
    public interface IUserProfileService
    {
        Task<IEnumerable<UserProfileDisplayDto>> GetAllUsersAsync();
        Task<UserProfileDisplayDto> GetUserByIdAsync(int id);

        Task<UserProfileDisplayDto> CreateUserAsync(UserProfileCreateUpdateDto createUserDto);
        Task<IEnumerable<UserProfileDisplayDto>> GetUsersByManagerIdAsync(int id);
        Task<bool> UpdateUserAsync(int id, UserProfileCreateUpdateDto updateUserDto);
        Task<string> GetGameInterestedByIdAsync(int id);
        Task<bool> DeleteUserAsync(int id);
        Task<Boolean> IsUserBannedAsync(int userId);
        Task<string> getUserEmailfromId(int id);
    }
}
