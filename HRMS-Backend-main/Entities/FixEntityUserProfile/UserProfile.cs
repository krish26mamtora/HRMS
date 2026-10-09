using HRMS_Backend.Entities.TravelandExpense;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace HRMS_Backend.Entities.FixEntityUserProfile
{
    public class UserProfile
    {

        [Key]
        [ForeignKey("User")]
        public int UserProfileId { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Designation { get; set; } = string.Empty;
        public string Gender { get; set; } = string.Empty;
        public int ManagerId { get; set; }
        [ForeignKey("ManagerId")]
        public User Manager { get; set; }
        public int Age { get; set; } 
        public string Department { get; set; } = string.Empty; 
        public string FavouriteSport { get; set; } = string.Empty;
        public DateOnly Birthday { get; set; } 
        public DateTime JoinDate { get; set; }
        public Boolean IsUserBanned { get; set; }
        public Boolean IsActive { get; set; }
        [JsonIgnore]
        public User User { get; set; }
    }
}
