using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HRMS_Backend.Entities.TravelandExpense
{
    public class TravelExpense
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        [Required]
        public int TravelAssignId { get; set; }
        [ForeignKey("TravelAssignId")]
        public TravelAssignment TravelAssignment;

        [Required]
        public int? ExpenseType { get; set; }
        [ForeignKey("ExpenseType")]
        public ExpensePolicy ExpensePolicy { get; set; }

        [StringLength(100)]
        public string Description { get; set; }
        public DateTime ExpenseDate { get; set; }
        [Required]
        [Column(TypeName = "decimal(7, 2)")]
        public decimal Amount { get; set; } = 0;
        [Required]
        public string Status { get; set; } = "pending";
        public string? HrRemarks { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public int? ApprovedBy { get; set; }
        [ForeignKey("ApprovedBy")]
        public User HrApprover { get; set; }

        public ICollection<ExpenseCreateEmail> ExpenseCreateEmail { get; set; }

    }
}