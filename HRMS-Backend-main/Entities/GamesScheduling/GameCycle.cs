using HRMS_Backend.Entities.Games_Scheduling;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HRMS_Backend.Entities.GamesScheduling
{
    public class GameCycle
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CycleId { get; set; }
        public int GamesId { get; set; }

        [ForeignKey("GamesId")]
        public Games Games { get; set; }

        [Required(ErrorMessage = "Start Time is Required")]
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        [Required]
        public Boolean isActive { get; set; }

        public ICollection<EmployeeCycleStats> EmployeeCycleStats { get; set; }
        public ICollection<GameSlots> GameSlots { get; set; }
    }
}
