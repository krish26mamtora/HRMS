using System.ComponentModel.DataAnnotations;

namespace HRMS_Backend.Model.JobListing
{
    public class ShareMailCreateUpdateDto
    {
        public int JobId { get; set; }

        [Required]
        [StringLength(100)]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        public string ReceiverMail { get; set; } = string.Empty;
        public int EmpId { get; set; }

        [StringLength(100)]
        public string Subject { get; set; } = string.Empty;

        [StringLength(200)]
        public string Message { get; set; } = string.Empty;
        public IFormFile? JobDescriptionPdf { get; set; }
    }
}
