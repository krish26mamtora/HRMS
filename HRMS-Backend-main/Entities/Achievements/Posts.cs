using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HRMS_Backend.Entities.Achievements
{
    public class Posts
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }


        public int? UserId { get; set; }
        [ForeignKey("UserId")]
        public User Author { get; set; } 

        [StringLength(50)]
        [Required(ErrorMessage = "Title is Required")]
        public string Title { get; set; } = string.Empty;

        [StringLength(150)]
        public string Description { get; set; } = string.Empty;

        public int? ModeratedByUserId { get; set; } 
        [ForeignKey("ModeratedByUserId")]
        public User Moderator { get; set; } 

        public bool IsVisible { get; set; }

        public int? DeletedByUserId { get; set; } 
        [ForeignKey("DeletedByUserId")]
        public User Deleter { get; set; } 

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public bool IsSystemGenerated { get; set; } = false;
        public DateTime? ExpiresAt { get; set; }
        public bool IsCurrentlyVisible => IsVisible && (!ExpiresAt.HasValue || ExpiresAt > DateTime.UtcNow);
        public ICollection<Comments> Comments { get; set; } = new List<Comments>();
        public  ICollection<PostImages> PostImages { get; set; } = new List<PostImages>();
        public PostInteraction PostInteraction { get; set; }
        public virtual ICollection<PostTagMap> PostTagMaps { get; set; } = new List<PostTagMap>();


    }
}
