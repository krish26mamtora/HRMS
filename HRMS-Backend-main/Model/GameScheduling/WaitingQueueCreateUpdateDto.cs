using System.ComponentModel.DataAnnotations;

namespace HRMS_Backend.Model.GameScheduling
{
    public class WaitingQueueCreateUpdateDto
    {

        public int BookingId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public int SlotId { get; set; }

        [Required]
        public int CycleId { get; set; }

        [StringLength(50)]
        public string Status { get; set; }
    }
}