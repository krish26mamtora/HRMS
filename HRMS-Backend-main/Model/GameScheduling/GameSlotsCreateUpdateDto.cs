using System.ComponentModel.DataAnnotations;

namespace HRMS_Backend.Model.GameScheduling
{
    public class GameSlotsCreateUpdateDto
    {
        [Required(ErrorMessage = "Game ID is required")]
        public int GamesId { get; set; }

        [Required(ErrorMessage = "Start Time is required")]
        public DateTime StartTime { get; set; }

        [Required(ErrorMessage = "End Time is required")]
        public DateTime EndTime { get; set; }
        public int Capacity { get; set; }
        public int Assigned { get; set; }
      
        [Required]
        public bool IsBookingOpen { get; set; }

    }
}
