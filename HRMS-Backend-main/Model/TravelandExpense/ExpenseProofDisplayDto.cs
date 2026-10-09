using HRMS_Backend.Entities.TravelandExpense;
using System.ComponentModel.DataAnnotations;

namespace HRMS_Backend.Model.TravelandExpense
{
    public class ExpenseProofDisplayDto
    {
        public int Id { get; set; }   
        public int TravelExpenseId { get; set; }
        public string ProofDocumentUrl { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
