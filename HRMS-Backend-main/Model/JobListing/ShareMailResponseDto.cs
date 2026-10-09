using System.ComponentModel.DataAnnotations;

namespace HRMS_Backend.Model.JobListing
{
    public class ShareMailResponseDto
    {

        public int JobId { get; set; }
        public string ReceiverMail { get; set; } = string.Empty;
        public int EmpId { get; set; }

        public string Subject { get; set; } = string.Empty;

        public string Message { get; set; } = string.Empty;
    }
}
