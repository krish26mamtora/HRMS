using System.ComponentModel.DataAnnotations;

namespace HRMS_Backend.Model.TravelandExpense
{
    public class TravelResponseDto
    {
        public int Id { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int NumDays { get; set; }
        public string Destination { get; set; } = string.Empty;
        public string Purpose { get; set; } = string.Empty;
        public string TripType { get; set; } = string.Empty;
        public string TravelMode { get; set; } = string.Empty;
        public int CreatedByUserId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastUpdatedAt { get; set; }
    }
}
