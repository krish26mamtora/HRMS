using HRMS_Backend.Entities.GamesScheduling;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HRMS_Backend.Entities.Games_Scheduling
{
    [Index(nameof(GamesId), nameof(StartTime), IsUnique = true)]
    public class GameSlots
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }


        public int GamesId { get; set; }
        [ForeignKey("GamesId")]
        public Games Games { get; set; }

        [Required(ErrorMessage = "Start Time is required")]
        public DateTime StartTime { get; set; }

        [Required(ErrorMessage = "End Time is required")]
        public DateTime EndTime { get; set; }

        public int CycleId { get; set; }
        [ForeignKey("CycleId")]
        public GameCycle GameCycle { get; set; }

        public int Capacity { get; set; }
        public int Assigned { get; set; }

        public bool SlotPlayed { get; set; }
        [Required]
        public bool IsBookingOpen { get; set; }
        public ICollection<Bookings> Bookings { get; set; }

        public ICollection<WaitingQueue> WaitingQueue { get; set; }
        public ICollection<BookingInvite> BookingInvite { get; set; }
    }
}
