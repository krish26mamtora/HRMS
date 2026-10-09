using HRMS_Backend.Entities.Games_Scheduling;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HRMS_Backend.Model.GameScheduling
{
    public class GameConfigCreateUpdateDto
    {
        public int Id { get; set; }
        public int GamesId { get; set; }

        [Required(ErrorMessage = "Start Time is Required")]
        public TimeOnly StartTime { get; set; }

        [Required(ErrorMessage = "End Time is Required")]
        public TimeOnly OverTime { get; set; } 
        [Required]
        public int SlotDuration { get; set; }
        [Required]
        [Range(1, 10, ErrorMessage = "Capacity Should be less then 10")]
        public int Capacity { get; set; }
    }
}
