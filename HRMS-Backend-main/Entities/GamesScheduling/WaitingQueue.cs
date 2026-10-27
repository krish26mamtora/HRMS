using HRMS_Backend.Entities.Games_Scheduling;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Microsoft.Identity.Client;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HRMS_Backend.Entities.GamesScheduling
{
    [Index(nameof(SlotId), nameof(PlayerId), IsUnique = true)]
    public class WaitingQueue
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int QueueId { get; set; }

        [Required]
        public int SlotId { get; set; }
        [ForeignKey("SlotId")]
        public GameSlots GameSlots { get; set; }


        [Required]
        public int CycleId { get; set; }
        [ForeignKey("CycleId")]
        public GameCycle GameCycle { get; set; }

        public DateTime InsertionTime { get; set; } = DateTime.UtcNow;
        public DateTime UpdationTime { get; set; } = DateTime.UtcNow;

        public string Status { get; set; }

        public int PlayerId { get; set; }
        [ForeignKey("PlayerId")]
        public User User { get; set; }

    }
}
