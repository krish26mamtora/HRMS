namespace HRMS_Backend.Model.Achievements
{
    public class PostTagMapDisplayDto
    {
        public int PostId { get; set; }
        public string PostTitle { get; set; } = string.Empty;
        public string TagName { get; set; } = string.Empty;
    }
}
