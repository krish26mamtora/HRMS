using System.ComponentModel.DataAnnotations;

namespace HRMS_Backend.Model.Achievements
{
    public class PostsCreateUpdateDto
    {
        public int? Id { get; set; } 

        [Required(ErrorMessage = "Title is required")]
        [StringLength(50)]
        public string Title { get; set; } = string.Empty;

        [StringLength(150)]
        public string Description { get; set; } = string.Empty;
        public bool IsVisible { get; set; } = true;
        public bool IsSystemGenerated { get; set; } = false;
        public List<IFormFile>? Images { get; set; }
        public List<int> TagIds { get; set; } = new();
    }
}
