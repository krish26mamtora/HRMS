using HRMS_Backend.Entities;
using HRMS_Backend.Entities.Games_Scheduling;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HRMS_Backend.Model.GameScheduling
{
    public class BookingsCreateUpdateDto
    {
        public int BId { get; set; }

        [Required]
        public int SlotId { get; set; }
        [ForeignKey("SlotId")]
        public GameSlots GameSlots { get; set; }

        public int BookedBy { get; set; }
        [ForeignKey("BookedBy")]
        public User User { get; set; }

        public string status { get; set; }

        public string bookedAt { get; set; }


        [Required]
        public Boolean SlotPlayed { get; set; }
    }
}
