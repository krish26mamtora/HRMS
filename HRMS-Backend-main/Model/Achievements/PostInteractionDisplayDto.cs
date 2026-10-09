namespace HRMS_Backend.Model.Achievements
{
    public class PostInteractionDisplayDto
    {
        public int PostId { get; set; }
        public int LikeCount { get; set; }
        public int CelebrateCount { get; set; }
        public int LoveCount { get; set; }
        public int InsightfulCount { get; set; }
        public int CommentCount { get; set; }
        public DateTime LastUpdatedAt { get; set; }
    }
}
