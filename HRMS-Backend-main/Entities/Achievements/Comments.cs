using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace HRMS_Backend.Entities.Achievements
{
    public class Comments
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public int PostsId { get; set; }

        [ForeignKey("PostsId")]
        public virtual Posts Post { get; set; }

        [Required]
        public int AuthorId { get; set; }

        [ForeignKey("AuthorId")]
        public virtual User Author { get; set; }

        [Required(ErrorMessage = "Comment text cannot be empty")]
        [StringLength(500, ErrorMessage = "Comment cannot exceed 500 characters")]
        public string Comment { get; set; } = string.Empty;

        public int? ParentCommentId { get; set; }

        [ForeignKey("ParentCommentId")]
        public virtual Comments? ParentComment { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public bool IsDeleted { get; set; } = false;

        public int? DeletedByUserId { get; set; }

        [ForeignKey("DeletedByUserId")]
        public virtual User? Deleter { get; set; }
        public virtual ICollection<Comments> Replies { get; set; } = new List<Comments>();
    }
}