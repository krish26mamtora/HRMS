using HRMS_Backend.Entities;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HRMS_Backend.Model.DtoUserProfile
{
    public class UserProfileCreateUpdateDto
    {

        public int UserProfileId { get; set; }
        [Required]
        public string FirstName { get; set; } = string.Empty;
        [Required]
        public string LastName { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;

        [Required]
        public string Gender { get; set; } = string.Empty;
        public DateOnly Birthday { get; set; }
        public string Designation { get; set; } = string.Empty;
        public int ManagerId { get; set; }
        [Range(1, 100, ErrorMessage = "Age must be between {1} and {2}.")]
        public int Age { get; set; }
        [Required]
        public string Department { get; set; } = string.Empty;
        [Required]
        public string FavouriteSport { get; set; } = string.Empty;
        [Required]
        public DateTime JoinDate { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
