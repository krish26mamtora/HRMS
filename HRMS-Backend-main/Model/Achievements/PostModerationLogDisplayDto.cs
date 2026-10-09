namespace HRMS_Backend.Model.Achievements
{
    public class PostModerationLogDisplayDto
    {
        public int Id { get; set; }
        public string EntityType { get; set; } = string.Empty;
        public int EntityId { get; set; }
        public string Action { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
        public string ModeratorName { get; set; } = string.Empty;
        public string TargetUserName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
