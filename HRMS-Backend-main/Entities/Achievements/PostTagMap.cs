using Azure;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HRMS_Backend.Entities.Achievements
{
    public class PostTagMap
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int PostTagMapId { get; set; }

        [Required]
        public int PostId { get; set; }

        [ForeignKey("PostId")] 
        public Posts Post { get; set; }

        [Required]
        public int TagId { get; set; }

        [ForeignKey("TagId")]
        public Tags Tag { get; set; }
      
    }
}
