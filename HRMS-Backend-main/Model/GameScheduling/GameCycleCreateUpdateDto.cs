using System.ComponentModel.DataAnnotations;

namespace HRMS_Backend.Model.GameScheduling
{
    public class GameCycleCreateUpdateDto
    {
        [Required(ErrorMessage = "Game ID is required")]
        public int GamesId { get; set; }

        [Required(ErrorMessage = "Start Time is required")]
        public DateTime StartTime { get; set; }

        [Required(ErrorMessage = "End Time is required")]
        public DateTime EndTime { get; set; }

        [Required]
        public Boolean isActive { get; set; }
    }
}