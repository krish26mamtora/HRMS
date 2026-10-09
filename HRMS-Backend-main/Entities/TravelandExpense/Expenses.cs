using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HRMS_Backend.Entities.TravelandExpense
{
    public class Expenses
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        [Required]
        public int TravelId { get; set; }
        public TravelPlan TravelPlan { get; set; }
        [Required]
        public int EmplId { get; set; }
        //[ForeignKey("EmplId")] 
        public User User { get; set; }
        [Required]
        public int? ExpenseType { get; set; }
        [ForeignKey("ExpenseType")]
        public ExpensePolicy ExpensePolicy { get; set; }
        [Required]
        [Column(TypeName = "decimal(7, 2)")]
        public decimal Amount { get; set; }
      
        [Required]
        public string Status { get; set; } = "pending";
        public string? HrRemarks { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int? ApprovedBy { get; set; }
        [ForeignKey("ApprovedBy")]
        public User HrApprover { get; set; }
    }
}
