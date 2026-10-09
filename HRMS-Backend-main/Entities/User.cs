using HRMS_Backend.Entities.Achievements;
using HRMS_Backend.Entities.FixEntityUserProfile;
using HRMS_Backend.Entities.Games_Scheduling;
using HRMS_Backend.Entities.GamesScheduling;
using HRMS_Backend.Entities.JobListing;
using HRMS_Backend.Entities.TravelandExpense;
using Microsoft.EntityFrameworkCore;
using System.Collections;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HRMS_Backend.Entities
{
    [Index(nameof(Email), IsUnique = true)]
    public class User
    {

        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;

      

        
        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Invalid email address format.")]
        [MaxLength(255, ErrorMessage = "Email cannot exceed 255 characters.")]
        public string Email { get; set; } = string.Empty;
        public UserProfile UserProfile { get; set; }
        public string PasswordHash { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public DateTime RefreshTokenExpiry { get; set; } = DateTime.UtcNow.AddDays(2);
        public ICollection<Jobs> Jobs { get; set; }
        public ICollection<Posts> Posts { get; set; }
        public ICollection<Referals> Referrals { get; set; }
        public ICollection<ShareEmail> ShareEmail {  get; set; }
        public ICollection<Notification> Notification { get; set; }
        public ICollection<TravelAssignment> TravelAssignment { get; set; }
        public ICollection<TravelPlan> TravelPlan { get; set; }
        public ICollection<Expenses> Expenses { get; set; }
        //[NotMapped]
        //public ICollection<UserProfile> UserProfile { get;set;}
        public ICollection<TravelExpense> TravelExpense { get; set; }
        public ICollection<TravelDocuments> TravelDocuments { get; set; }
        public ICollection<TravelAssignEmail> TravelAssignEmail { get; set; }
        public ICollection<BookingParticipants> BookingParticipants { get; set; }
        public ICollection<EmployeeCycleStats> EmployeeCycleStats { get; set; }
        public ICollection<WaitingQueue> WaitingQueue { get; set; }

        public ICollection<GameSlots> GameSlots { get; set; }

        public ICollection<BookingInvite> BookingInvite {  get; set; }

    }
}

