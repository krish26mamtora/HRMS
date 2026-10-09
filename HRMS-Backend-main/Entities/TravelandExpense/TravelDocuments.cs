using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HRMS_Backend.Entities.TravelandExpense
{
    public class TravelDocuments
    {

        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public int UploadedBy { get; set; }
        [ForeignKey("UploadedBy")]
        public User User { get; set; }


        [Required]
        public string Type { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        [Required]

        public int TravelAssignmentId { get; set; }
        [ForeignKey("TravelAssignmentId")]
        public TravelAssignment TravelAssignment { get; set; }



        [Required]
        public string TravelDocumentUrl { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }

    }
}
