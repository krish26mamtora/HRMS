using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HRMS_Backend.Entities.TravelandExpense
{
    public class TravelPlan
    {

        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int NumDays { get; set; }
        [Required]
        [StringLength(100)]
        public string Destination {  get; set; } = string.Empty;
        [Required]
        [StringLength(500)]
        public string Purpose { get; set; } = string.Empty;
        [Required]
        [StringLength(100)]
        public string TripType { get; set; } = string.Empty;
        [Required]
        [StringLength(100)]
        public string TravelMode { get; set; } = string.Empty;
        public int CreatedByUserId { get; set; }
        //[ForeignKey("CreatedByUserId")]
        public User User { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastUpdatedAt { get; set; }
        public ICollection<TravelAssignment> TravelAssignment { get; set; }
        public ICollection<Expenses> Expenses { get; set; }
        public ICollection<TravelDocuments> TravelDocuments { get; set; }
        public ICollection<TravelAssignEmail> TravelAssignEmail { get; set; }
    }
}
