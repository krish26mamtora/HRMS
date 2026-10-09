using HRMS_Backend.Entities;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HRMS_Backend.Model.JobListing
{
    public class JobRefferalCreateUpdateDto
    {
        public int Id { get; set; }

        public int JobId { get; set; }

        [StringLength(20)]
        [Required(ErrorMessage = "Refferal Name is required")]
        public string ReffName { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        public string ReffMail { get; set; } = string.Empty;

        public List<string> ReceiverEmails { get; set; }
        //[Required(ErrorMessage = "Resume is required")]
        [NotMapped]
        public IFormFile? ReffResume { get; set; }
        public int EmpId { get; set; }

        [StringLength(200)]
        public string Description { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
