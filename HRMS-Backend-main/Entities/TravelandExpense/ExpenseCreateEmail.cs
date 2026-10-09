using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HRMS_Backend.Entities.TravelandExpense
{
    public class ExpenseCreateEmail
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        [Required]
        public int TravelExpenseId { get; set; }
        [ForeignKey("TravelExpenseId")]
        public TravelExpense TravelExpense { get; set; }
        [Required]
        [StringLength(255)]
        public string RecipientEmail { get; set; }
        public int SenderId { get; set; }
        [Required]
        [StringLength(100)]
        public string Subject { get; set; }

        public DateOnly ExpenseDate { get; set; }
        public string Body { get; set; }
        [Required]
        [StringLength(50)]
        public string Status { get; set; } = "Pending";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? SentAt { get; set; }
    }
}
