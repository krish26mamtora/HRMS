using HRMS_Backend.Entities.Games_Scheduling;
using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

using System.ComponentModel.DataAnnotations.Schema;

namespace HRMS_Backend.Entities.GamesScheduling
{
    [Index(nameof(UserId) , nameof(GameCycleId) , IsUnique = true)]

    public class EmployeeCycleStats
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int SId { get; set; }

        [Required]
        public int UserId { get; set; }
        [ForeignKey("UserId")]
        public User User { get; set; }


        [Required]
        public int GameCycleId { get; set; }
        [ForeignKey("GameCycleId")]
        public GameCycle GameCycle { get; set; }

        [Required]
        public int GamePlayed { get; set; }
    }
}