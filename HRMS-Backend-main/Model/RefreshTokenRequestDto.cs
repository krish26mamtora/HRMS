namespace HRMS_Backend.Model
{
    public class RefreshTokenRequestDto
    {
        public Guid userId { get; set; }
        public string RefreshToken { get; set; } = string.Empty ;
    }
}
