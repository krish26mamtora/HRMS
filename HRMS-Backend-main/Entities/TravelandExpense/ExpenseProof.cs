using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HRMS_Backend.Entities.TravelandExpense
{
    public class ExpenseProof
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        [Required]
        public int TravelExpenseId { get; set; }
        [ForeignKey("TravelExpenseId")]
        public TravelExpense TravelExpense { get; set; }
        [Required]
        public string ProofDocumentUrl { get; set;  } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    }

}
