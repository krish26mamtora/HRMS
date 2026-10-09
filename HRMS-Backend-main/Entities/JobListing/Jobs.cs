using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace HRMS_Backend.Entities.JobListing
{
    public class Jobs
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(50)]
        [Required(ErrorMessage = "Title is required")]
        public string Title { get; set; } = string.Empty;

        [StringLength(300)]
        [Required(ErrorMessage = "Description is Required")]
        public string Description { get; set; } = string.Empty;
        [StringLength(20)]
        public string Status { get; set; } = "Open";
        [Range(0,50 , ErrorMessage ="Experiance Should be in range 0 to 50")]
        public int ExpYearsReq { get; set; }
        public int ManagedBy { get; set; }
        [ForeignKey("ManagedBy")]
        public User User { get; set; }
        [StringLength(100)]
        [Required(ErrorMessage = "Role is required")]
        public string Role { get; set; } = string.Empty;
        [Required]
        public int TotalPositions { get; set; } = 1;

        [StringLength(100)]
        [Required(ErrorMessage = "Job Description is required")]
        public string JdUrl { get; set; } = string.Empty;

        [EmailAddress(ErrorMessage = "Invalid email format")]
        public string ContactMail { get; set; } = "ab@gmail.com";
        public string ReviewerEmail { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public ICollection<Referals> Referals { get; set; }

        public ICollection<ShareEmail> ShareEmail { get; set; }
    }
}
