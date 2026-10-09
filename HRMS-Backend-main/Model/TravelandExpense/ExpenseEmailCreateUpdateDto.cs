using System.ComponentModel.DataAnnotations;

namespace HRMS_Backend.Model.TravelandExpense
{
    public class ExpenseEmailCreateUpdateDto
    {
        [Required(ErrorMessage = "TravelExpenseId is required")]
        public int TravelExpenseId { get; set; }

        [Required(ErrorMessage = "Recipient email is required")]
        [StringLength(255)]
        [EmailAddress(ErrorMessage = "Invalid email address")]
        public string RecipientEmail { get; set; }
        public int SenderId { get; set; }

        public DateOnly ExpenseDate { get; set; }
        [Required(ErrorMessage = "Subject is required.")]
        [StringLength(100)]
        public string Subject { get; set; }

        public string Body { get; set; }
    }
}
