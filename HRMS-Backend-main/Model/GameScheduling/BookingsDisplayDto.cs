using HRMS_Backend.Entities;
using HRMS_Backend.Entities.Games_Scheduling;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HRMS_Backend.Model.GameScheduling
{
    public class BookingsDisplayDto
    { 
        public int BId { get; set; }
        public int SlotId { get; set; }
        public int BookedBy { get; set; }
        public string status { get; set; }
        public string bookedAt { get; set; }
        public Boolean SlotPlayed { get; set; }
    }
}
