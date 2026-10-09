using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HRMS_Backend.Entities.JobListing
{
    public class ShareEmail
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public int JobId { get; set; }
        public Jobs Job { get; set; }

        [Required]
        [StringLength(100)]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        public string ReceiverMail { get; set; } = string.Empty;

        public int EmpId { get; set; }
        public User User { get; set; }

        [StringLength(100)]
        public string Subject { get; set; } = string.Empty;

        [StringLength(200)]
        public string Message { get; set; } = string.Empty;

        [StringLength(200)]
        public string? AttachedFileName { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;



    }
}
