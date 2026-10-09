using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics.Metrics;

namespace HRMS_Backend.Entities.TravelandExpense
{
    [Index(nameof(EmpId), nameof(PId), IsUnique = true)]
    public class TravelAssignment
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public int EmpId { get; set; }
        [ForeignKey("EmpId")]
        public User User { get; set; }
        public int PId {  get; set; }
        [ForeignKey("PId")]
        public TravelPlan TravelPlan { get; set; }
        public string Status { get; set; } = "Pending";
        public DateTime CreatedAt { get; set; }
        public DateTime? LastUpdatedAt { get; set; }
        public ICollection<TravelExpense> TravelExpense { get; set; }
        public ICollection<TravelDocuments> TravelDocuments { get; set; }

    }
}

