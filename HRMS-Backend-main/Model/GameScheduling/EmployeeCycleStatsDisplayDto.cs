using HRMS_Backend.Entities;
using HRMS_Backend.Entities.GamesScheduling;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HRMS_Backend.Model.GameScheduling
{
    public class EmployeeCycleStatsDisplayDto
    {
        public int SId { get; set; }
        public int UserId { get; set; }
        public int GameCycleId { get; set; }
        public int GamePlayed { get; set; }
    }
}
