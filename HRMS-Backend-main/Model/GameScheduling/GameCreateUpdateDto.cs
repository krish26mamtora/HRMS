using System.ComponentModel.DataAnnotations;

namespace HRMS_Backend.Model.GameScheduling
{
    public class GameCreateUpdateDto
    {

        [StringLength(50)]
        [Required(ErrorMessage = "Game ID is required")]
        public string Name { get; set; } = string.Empty;

        [StringLength(100)]
        [Required(ErrorMessage = "Game Name is required")]
        public string Location { get; set; } = string.Empty;
        [Required]
        public bool IsAvailable { get; set; }
    }
}
