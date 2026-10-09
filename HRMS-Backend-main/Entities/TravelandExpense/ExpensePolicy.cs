using HRMS_Backend.Entities.JobListing;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HRMS_Backend.Entities.TravelandExpense
{
    public class ExpensePolicy
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public string Category { get; set; } = string.Empty;

        [Range(1, 500000, ErrorMessage = "Expense type must be positive")]
        public int MaxAmout { get; set; }

        public ICollection<Expenses> Expenses { get; set; }
    }
}
