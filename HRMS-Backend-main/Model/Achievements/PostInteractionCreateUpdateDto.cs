using System.ComponentModel.DataAnnotations;

namespace HRMS_Backend.Model.Achievements
{
    public class PostInteractionCreateUpdateDto
    {
        [Required]
        public int PostId { get; set; }

        [Required]
        [RegularExpression("Like|Celebrate|Love|Insightful", ErrorMessage = "Invalid reaction type")]
        public string ReactionType { get; set; } = "Like";

        // Set to true to add the reaction, false to remove (unlike)
        public bool IsActive { get; set; } = true;
    }
}
