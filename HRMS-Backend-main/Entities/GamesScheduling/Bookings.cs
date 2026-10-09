using HRMS_Backend.Entities.Games_Scheduling;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HRMS_Backend.Entities.GamesScheduling
{
    public class Bookings
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int BId { get; set; }

        [Required]
        public int SlotId { get; set; }
        [ForeignKey("SlotId")]
        public GameSlots GameSlots { get; set; }

        public int BookedBy { get; set; }
        [ForeignKey("BookedBy")]
        public User User { get; set; }
        
        public string Status { get; set; }

        public DateTime BookedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        //[Required]
        //public Boolean SlotPlayed { get; set; }
        public ICollection<WaitingQueue> WaitingQueue {  get; set; }
        public ICollection<BookingParticipants> BookingParticipants { get; set; }
    }
}
