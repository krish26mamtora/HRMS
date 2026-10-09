using System.ComponentModel.DataAnnotations;

namespace HRMS_Backend.Entities.Achievements
{
    public class UserPostReaction
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int PostId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public string ReactionType { get; set; }

        public DateTime ReactedAt { get; set; } = DateTime.UtcNow;
    }
}
