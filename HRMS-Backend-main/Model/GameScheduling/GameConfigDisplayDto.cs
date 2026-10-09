using HRMS_Backend.Entities.Games_Scheduling;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HRMS_Backend.Model.GameScheduling
{
    public class GameConfigDisplayDto
    {
        public int Id { get; set; }
        public int GamesId { get; set; }
        public TimeOnly StartTime { get; set; }
        public TimeOnly OverTime { get; set; }
        public int SlotDuration { get; set; }
        public int Capacity { get; set; }
    }
}
