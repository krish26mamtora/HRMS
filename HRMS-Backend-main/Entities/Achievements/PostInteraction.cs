using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HRMS_Backend.Entities.Achievements
{
    public class PostInteraction
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public int PostId { get; set; }

        [ForeignKey("PostId")]
        public Posts Post { get; set; } 
        public int LikeCount { get; set; } = 0;
        public int CelebrateCount { get; set; } = 0;
        public int LoveCount { get; set; } = 0;
        public int InsightfulCount { get; set; } = 0;
        public int CommentCount { get; set; } = 0;

        public DateTime LastUpdatedAt { get; set; } = DateTime.UtcNow;

    }
}
