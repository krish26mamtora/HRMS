using HRMS_Backend.Entities.Games_Scheduling;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HRMS_Backend.Entities.GamesScheduling
{
    [Table("BookingInvite")]
    public class BookingInvite
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public int UserId { get; set; }
        [ForeignKey("UserId")]
        public virtual User User { get; set; }
        public int SlotId { get; set; }
        [ForeignKey("SlotId")]
        public virtual GameSlots Slot { get; set; }
        public int CycleId { get; set; }
        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Pending";
        public string InviteToken { get; set; } = Guid.NewGuid().ToString();

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime ExpiresAt { get; set; }
        public string InviteReason { get; set; }
    }   
}
