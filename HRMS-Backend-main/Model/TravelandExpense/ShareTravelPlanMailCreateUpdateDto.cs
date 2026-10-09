using System.ComponentModel.DataAnnotations;

namespace HRMS_Backend.Model.TravelandExpense
{
    public class ShareTravelPlanMailCreateUpdateDto
    {
        public int PId { get; set; }

        [Required]
        [StringLength(100)]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        public string ReceiverMail { get; set; }
        public int EmpId { get; set; }

        [StringLength(100)]
        public string Subject { get; set; } = string.Empty;

        [StringLength(200)]
        public string Message { get; set; } = string.Empty;
    }
}

