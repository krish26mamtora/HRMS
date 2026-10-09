using HRMS_Backend.Entities.JobListing;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HRMS_Backend.Entities.TravelandExpense
{
    public class TravelAssignEmail
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public int PId { get; set; }
        [ForeignKey("PId")]
        public TravelPlan TravelPlan { get; set; }

        [Required]
        [StringLength(100)]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        public string ReceiverMail { get; set; } = string.Empty;

        public int EmpId { get; set; }
        [ForeignKey("EmpId")]
        public User User { get; set; }

        [StringLength(100)]
        public string Subject { get; set; } = string.Empty;

        [StringLength(200)]
        public string Message { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
