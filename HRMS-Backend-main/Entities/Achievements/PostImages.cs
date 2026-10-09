using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HRMS_Backend.Entities.Achievements
{
    public class PostImages
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ImageId { get; set; }

        [Required]
        [StringLength(255)]
        public string ImagePath { get; set; } = null!;

        public int PostId { get; set; }
        [ForeignKey("PostId")]
        public virtual Posts Post { get; set; } = null!;
    }
}
