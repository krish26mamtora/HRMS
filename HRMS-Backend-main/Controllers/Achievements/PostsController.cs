using HRMS_Backend.Data;
using HRMS_Backend.Model.Achievements;
using HRMS_Backend.Services.Achievements;
using HRMS_Backend.Services.Email;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HRMS_Backend.Controllers.Achievements
{
    [Authorize] 
    [Route("api/[controller]")]
    [ApiController]
    public class PostsController : ControllerBase
    {
        private readonly IPostsService _postsService;

        private readonly IEmailService _emailService;
        public PostsController(IPostsService postsService , IEmailService emailService)
        {
            _postsService = postsService;
            _emailService = emailService;
        }
        [HttpPost("upsert")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UpsertPost([FromForm] PostsCreateUpdateDto dto)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if(string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int currentUserId))
            {
                return Unauthorized("User ID not found in token.");
            }
        
            try{    
                if (dto.Id.HasValue && dto.Id > 0)
                {
                    var success = await _postsService.UpdatePostAsync(dto.Id.Value, dto);
                    return success ? Ok("Post Updated Successfully") : BadRequest("Update Failed");
                 }
                else
                {
                    var post = await _postsService.CreatePostAsync(dto, currentUserId);
                    return Ok(post);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal Server Error: {ex.Message}");
            }
        }
        [HttpGet("all")]
        public async Task<ActionResult<IEnumerable<PostsDisplayDto>>> GetAllPosts()
        {
            var posts = await _postsService.GetAllVisiblePostsAsync();
            return Ok(posts);
        }
        [HttpGet("feed")]
        public async Task<ActionResult<IEnumerable<PostsDisplayDto>>> getFeed([FromQuery] int pageNumber=1  , [FromQuery] int pageSize = 10)
        {
            var items = await _postsService.getFeedItemsAsync(pageNumber, pageSize);
            return Ok(items);
        }
        [HttpGet("user/history")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<PostsDisplayDto>>> GetMyPostsHistory()
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();

            int userId = int.Parse(userIdClaim);
            var posts = await _postsService.GetUserPostsHistoryAsync(userId);

            return Ok(posts);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PostsDisplayDto>> GetPost(int id)
        {
            var post = await _postsService.GetPostByIdAsync(id);
            if (post == null) return NotFound("Post not found");
            return Ok(post);
        }
        [HttpPost("react")]
        public async Task<IActionResult> ToggleReaction([FromBody] PostInteractionCreateUpdateDto dto)
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();
            int userId = int.Parse(userIdClaim);

            var result = await _postsService.ToggleReactionAsync(dto, userId);
            return result ? Ok("Reaction Updated") : BadRequest("Could not process reaction");
        }
     
        [Authorize(Roles = "HR")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePost(int id, [FromQuery] int userId, string reason)
        {
            if (string.IsNullOrWhiteSpace(reason)) return BadRequest("A reason is required.");

            var post = await _postsService.SoftDeletePostAsync(id, userId, reason);

            if (post == null) return NotFound("Post not found or already deleted");

            if (post.Author != null && !string.IsNullOrEmpty(post.Author.Email))
            {
                try
                {
                    var subject = $"Action Required: Your post '{post.Title}' has been removed";

                    var body = $@"
                        Post Removal Notification
        
                        Hello,

                        Your post has been removed by HR.

                        --- Post Details ---
                        Title: {post.Title}
                        Description: {post.Description}
        
                        Reason for Removal: 
                        {reason}

                        Date: {DateTime.UtcNow:f} UTC

                        If you have any questions, please contact the HR department.";

                    await _emailService.SendEmailAsync(post.Author.Email, subject, body);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error sending email to {post.Author.Email}: {ex.Message}");
                }
            }
            return Ok("Post Deleted Successfully");

        }
        [HttpDelete("my-post/{id}")]
        public async Task<IActionResult> DeleteMyPost(int id)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int currentUserId))
                return Unauthorized();

            var success = await _postsService.SoftDeleteOwnPostAsync(id, currentUserId);

            if (!success)
                return NotFound("Post not found or you don't have permission to delete it.");

            return Ok("Post hidden successfully.");
        }
        [HttpPut("restore/{id}")]
        [Authorize]
        public async Task<IActionResult> RestoreMyPost(int id)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int currentUserId))
            {
                return Unauthorized();
            }
            var result = await _postsService.RestoreOwnPostAsync(id, currentUserId);

            if (!result.Success)
            {
                if (result.Message == "HR_Removed")
                 {
                    return Forbid(); 
                }
                return NotFound(result.Message);
            }

            return Ok("Post restored successfully.");
        }

        [HttpPut("hr-restore/{id}")]
        [Authorize(Roles = "HR")]
        public async Task<IActionResult> RestoreAsHR(int id)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int currentUserId)) return Unauthorized();

            var post = await _postsService.RestoreModeratedPostAsync(id, currentUserId);

            if (post == null) return NotFound("Post not found or you don't have permission to restore it.");

            if (post.Author != null && !string.IsNullOrEmpty(post.Author.Email))
            {
                try
                {
                    var subject = $"Good News: Your post '{post.Title}' has been restored";

                    var body = $@"
                        Post Restoration Notification

                        Hello,

                        Your post has been reviewed and restored by HR. It is now visible to the public feed again.

                        --- Post Details ---
                        Title: {post.Title}
                        Description: {post.Description}

                        Date: {DateTime.UtcNow:f} UTC

                        If you have any questions, please contact the HR department.";

                            await _emailService.SendEmailAsync(post.Author.Email, subject, body);
                        }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error sending email to {post.Author.Email}: {ex.Message}");
                }
            }

            return Ok("Post Restored Successfully");
        }
        [HttpGet("moderated-history")]
        [Authorize(Roles = "HR")]
        public async Task<ActionResult<IEnumerable<PostsDisplayDto>>> GetModeratedHistory()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int currentUserId))
             {
                return Unauthorized(); 
            }

            var posts = await _postsService.GetModeratedPostsAsync(currentUserId);
            return Ok(posts);
        }
        [HttpGet("tags")]
        public async Task<IActionResult> GetTags()
        {
            var tags = await _postsService.GetAllTagsAsync();
            return Ok(tags);
        }
    }
}
