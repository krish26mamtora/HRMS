namespace HRMS_Backend.Model.Achievements
{
    public class PostsDisplayDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsSystemGenerated { get; set; }
        public string AuthorName { get; set; } = string.Empty;
        public List<string> ImageUrls { get; set; } = new();
        public List<string> TagNames { get; set; } = new();
        public bool IsVisible { get; set; }

        public PostInteractionDisplayDto PostInteraction { get; set; } = new();
        public DateTime CreatedAt { get; set; }
    }
}
