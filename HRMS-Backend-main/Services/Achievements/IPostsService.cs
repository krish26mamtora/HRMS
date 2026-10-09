using HRMS_Backend.Entities.Achievements;
using HRMS_Backend.Model.Achievements;

namespace HRMS_Backend.Services.Achievements
{
    public interface IPostsService
    {
        Task<PostsDisplayDto> CreatePostAsync(PostsCreateUpdateDto command, int currentUserId);
        Task<IEnumerable<PostsDisplayDto>> GetAllVisiblePostsAsync();
        Task<bool> ToggleReactionAsync(PostInteractionCreateUpdateDto interaction, int userId);
        Task<PostsDisplayDto?> GetPostByIdAsync(int id);
        Task<Posts?> SoftDeletePostAsync(int id, int currentUserId, string reason);
        Task<bool>  UpdatePostAsync(int id , PostsCreateUpdateDto dto);
        Task<IEnumerable<PostsDisplayDto>> GetUserPostsHistoryAsync(int userId);
        Task<int> GenerateSystemPosts();
        Task<int> GenerateAnniversaryPosts();
        Task<IEnumerable<TagsDisplayDto>> GetAllTagsAsync();

        Task<List<PostsDisplayDto>> getFeedItemsAsync(int pageNumber, int pageSize);

        Task<bool> SoftDeleteOwnPostAsync(int id, int userId);
        Task<(bool Success, string Message)> RestoreOwnPostAsync(int postId, int userId);
        Task<IEnumerable<PostsDisplayDto>> GetModeratedPostsAsync(int hrUserId);
        Task<Posts> RestoreModeratedPostAsync(int postId, int hrUserId);
    }
}
