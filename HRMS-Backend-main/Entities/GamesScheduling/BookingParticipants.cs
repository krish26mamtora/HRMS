using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;

namespace HRMS_Backend.Entities.GamesScheduling
{
    [Index(nameof(BookingId) , nameof(EmpId)  , IsUnique = true)]
    public class BookingParticipants
    {
        public int Id { get; set; }

        public int BookingId { get; set; }
        [ForeignKey("BookingId")]
        public Bookings Bookings { get; set; }

        public int EmpId { get; set; }
        [ForeignKey("EmpId")]
        public User User { get; set; }


    }
}
