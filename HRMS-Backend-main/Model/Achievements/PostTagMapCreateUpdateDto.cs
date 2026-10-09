using System.ComponentModel.DataAnnotations;

namespace HRMS_Backend.Model.Achievements
{
    public class PostTagMapCreateUpdateDto
    {
        [Required]
        public int PostId { get; set; }

        [Required]
        public List<int> TagIds { get; set; } = new();
    }
}
