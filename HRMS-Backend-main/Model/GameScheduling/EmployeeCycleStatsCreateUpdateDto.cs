using HRMS_Backend.Entities;
using HRMS_Backend.Entities.GamesScheduling;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HRMS_Backend.Model.GameScheduling
{
    public class EmployeeCycleStatsCreateUpdateDto
    {
        [Required]
        public int UserId { get; set; }

        [Required]
        public int GameCycleId { get; set; }

        [Required]
        public int GamePlayed { get; set; }
    }
}
