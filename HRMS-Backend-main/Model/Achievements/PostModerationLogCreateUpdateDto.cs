using System.ComponentModel.DataAnnotations;

namespace HRMS_Backend.Model.Achievements
{
    public class PostModerationLogCreateUpdateDto
    {
        public int? Id { get; set; }

        [Required]
        public int EntityId { get; set; }

        [Required]
        [RegularExpression("Post|Comment", ErrorMessage = "EntityType must be 'Post' or 'Comment'")]
        public string EntityType { get; set; } = "Post";

        [Required]
        [StringLength(50)]
        public string Action { get; set; } = string.Empty; 

        [Required]
        [StringLength(250, ErrorMessage = "Please provide a reason for this action")]
        public string Reason { get; set; } = string.Empty;

        [Required]
        public int TargetUserId { get; set; }

    }
}
