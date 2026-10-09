using System.ComponentModel.DataAnnotations;

namespace HRMS_Backend.Model.Achievements
{
    public class CommentsCreateUpdateDto
    {
        public int? Id { get; set; }

        [Required]
        public int PostId { get; set; }

        public int? ParentCommentId { get; set; } 

        [Required]
        [StringLength(500)]
        public string Comment { get; set; } = string.Empty;
    }
}
