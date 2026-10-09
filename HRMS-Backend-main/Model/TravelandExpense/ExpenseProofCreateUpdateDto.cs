using HRMS_Backend.Entities.TravelandExpense;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HRMS_Backend.Model.TravelandExpense
{
    public class ExpenseProofCreateUpdateDto
    {
      
        public int Id { get; set; }
        [Required]
        public int TravelExpenseId { get; set; }

        [NotMapped]
        public IFormFile? ProofDocument { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
