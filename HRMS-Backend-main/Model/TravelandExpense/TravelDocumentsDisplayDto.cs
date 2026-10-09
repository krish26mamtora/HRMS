using System.ComponentModel.DataAnnotations;

namespace HRMS_Backend.Model.TravelandExpense
{
    public class TravelDocumentsDisplayDto
    {
        public int Id { get; set; }
     
        public int UploadedBy { get; set; }

        public string Type { get; set; } = string.Empty;

        public string Description { get; set; }
        //public int TravelPlanId { get; set; }

        public int TravelAssignmentId { get; set; }

        public string TravelDocumentUrl { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
