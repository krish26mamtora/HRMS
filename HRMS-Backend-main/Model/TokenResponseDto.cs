using Azure.Core;

namespace HRMS_Backend.Model
{
    public class TokenResponseDto
    {
        public string AccessToken {get;set; } = string.Empty;
        public string RefreshToken {  get;set; } = string.Empty;

        public string Role { get; set; } = string.Empty;
        public string Id { get; set; } = string.Empty;
    }
}

