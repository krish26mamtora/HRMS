using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HRMS_Backend.Entities.Achievements
{
    public class AchievementNotification
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; } 

        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;

        [Required]
        [StringLength(255)]
        public string Message { get; set; } = string.Empty; 

        public bool IsRead { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int? ModerationLogId { get; set; }
        [ForeignKey("ModerationLogId")]
        public virtual PostModerationLog? ModerationLog { get; set; }
    }
}
