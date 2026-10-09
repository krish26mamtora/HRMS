using System.ComponentModel.DataAnnotations;

namespace HRMS_Backend.Model.DtoUserProfile
{
    public class UserProfileDisplayDto
    {
        public int UserProfileId { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Gender { get; set; } = string.Empty;
        public int ManagerId { get; set; }
        public string Designation { get; set; } = string.Empty;
        public DateOnly Birthday { get; set; }
        public int Age { get; set; }
        public string Department { get; set; } = string.Empty;
        public string FavouriteSport { get; set; } = string.Empty;
        public DateTime JoinDate { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
