namespace HRMS_Backend.Model.Achievements
{
    public class CommentsDisplayDto
    {
        public int Id { get; set; }
        public string Comment { get; set; } = string.Empty;
        public int AuthorId { get; set; }
        //public string AuthorName { get; set; } = string.Empty;
        public string AuthorEmail { get; set; } = string.Empty;
        public int? ParentCommentId { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<CommentsDisplayDto> Replies { get; set; } = new();
    }
}
