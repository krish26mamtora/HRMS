using HRMS_Backend.Entities;
using HRMS_Backend.Entities.Games_Scheduling;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HRMS_Backend.Model.GameScheduling
{
    public class BookingRequestCreateDto
    {
        public int BId { get; set; }

        [Required]
        public int SlotId { get; set; }
        [Required]
        public int BookedBy { get; set; }

        public string status { get; set; } = string.Empty;
        [Required]
        public List<int> userIds { get; set; } = new List<int>();
    }
}
