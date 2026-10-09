using HRMS_Backend.Entities;
using HRMS_Backend.Entities.TravelandExpense;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HRMS_Backend.Model.TravelandExpense
{
    public class TravelDocumentsCreateUpdateDto
    {
    
        public int Id { get; set; }
        [Required]
        public int UploadedBy { get; set; }
        [Required]

        public string Type { get; set; } = string.Empty;
        public string Description { get; set; }
        [Required]
        //public int TravelPlanId { get; set; }

        public int TravelAssignmentId { get; set; }


        [NotMapped]
        public IFormFile? TravelDocument { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
