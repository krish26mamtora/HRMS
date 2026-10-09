using System.ComponentModel.DataAnnotations;

namespace HRMS_Backend.Model.Achievements
{
    public class TagsCreateUpdateDto
    {
        public int? Id { get; set; }

        [Required]
        [StringLength(50)]
        public string TagName { get; set; } = string.Empty;
    }
}
