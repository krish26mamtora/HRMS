using Org.BouncyCastle.Bcpg;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HRMS_Backend.Entities.Achievements
{
    public class PostModerationLog
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public string EntityType { get; set; } = string.Empty; 

        [Required]
        public int EntityId { get; set; } 

        [Required]
        [StringLength(50)]
        public string Action { get; set; } = string.Empty; //Deleted, Hidden, Restored

        [Required]
        [StringLength(250)]
        public string Reason { get; set; } = string.Empty;

        [Required]
        public int ModeratedByUserId { get; set; }

        [ForeignKey("ModeratedByUserId")]
        public virtual User Moderator { get; set; } = null!;

        [Required]
        public int TargetUserId { get; set; }

        [ForeignKey("TargetUserId")]
        public virtual User TargetUser { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
