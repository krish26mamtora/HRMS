using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HRMS_Backend.Model.JobListing
{
    public class JobCreateUpdateDto
    {
        public int? Id { get; set; }
        [StringLength(50)]
        [Required(ErrorMessage = "Title is required")]
        public string Title { get; set; } = string.Empty;

         [StringLength(300)]
        [Required(ErrorMessage = "Description is required")]
       public  string Description {  get; set; } = string.Empty;

        [Required]
       public  int ManagedBy { get; set; }

        public string Status { get; set; } = "Open";

        [StringLength(100)]
        [Required(ErrorMessage = "Role is required")]
        public string Role {  get; set; } = string.Empty;

        public string ReviewerEmail { get; set; } = string.Empty;

        [Required]
       public  int TotalPositions { get; set; }

        [Range(0, 50, ErrorMessage = "Experience Should be in range 0 to 50")]
       public  int ExpYearsReq { get; set; }

        [NotMapped]
        public IFormFile? JdUrl { get; set; } 

        [EmailAddress(ErrorMessage = "Invalid email format")]
        public string ContactMail { get; set; } = string.Empty;

    }
}
