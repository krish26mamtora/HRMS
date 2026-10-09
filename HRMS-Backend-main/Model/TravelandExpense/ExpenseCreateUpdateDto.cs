using HRMS_Backend.Entities;
using HRMS_Backend.Entities.TravelandExpense;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HRMS_Backend.Model.TravelandExpense
{
    public class ExpenseCreateUpdateDto
    {
        
        //public int Id { get; set; }
        [Required]
        public int TravelAssignId { get; set; }

        [Required]
        public int? ExpenseType { get; set; }       
        
        [Required]
        [Column(TypeName = "decimal(7, 2)")]
        public decimal Amount { get; set; }
        [StringLength(100)]
        public string Description { get; set; }
        public DateTime ExpenseDate { get; set; }

        [Required]
        public string Status { get; set; } = "pending";
        public string? HrRemarks { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public int? ApprovedBy { get; set; }

    }
}
