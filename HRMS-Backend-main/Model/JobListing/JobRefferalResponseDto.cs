using System.ComponentModel.DataAnnotations;

namespace HRMS_Backend.Model.JobListing
{
    public class JobRefferalResponseDto
    {
        public int JobId { get; set; }
        public string ReffName { get; set; } = string.Empty;
        public string ReffMail { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string ReffResumeUrl { get; set; } = string.Empty;
        public int EmpId { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
