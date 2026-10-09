using HRMS_Backend.Entities;
using HRMS_Backend.Model.Achievements;
using HRMS_Backend.Services.Achievements;
using HRMS_Backend.Services.Email;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using RouteAttribute = Microsoft.AspNetCore.Mvc.RouteAttribute;

namespace HRMS_Backend.Controllers.Achievements
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CommentController : ControllerBase
    {
        private readonly ICommentService _commentService;
        private readonly IEmailService _emailService;

        public CommentController(ICommentService commentService , IEmailService emailService)
        {
            _commentService = commentService;
            _emailService = emailService;
        }

        [HttpPost]
        public async Task<ActionResult<CommentsDisplayDto>> UpsertComment([FromBody] CommentsCreateUpdateDto dto)
        {
            try
            {
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();

                int userId = int.Parse(userIdClaim);
                var result = await _commentService.CreateOrUpdateCommentAsync(userId, dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("post/{postId}")]
        public async Task<ActionResult<List<CommentsDisplayDto>>> GetCommentsByPost(int postId)
        {
            var results = await _commentService.GetCommentsByPostIdAsync(postId);
            return Ok(results);
        }
        [HttpGet("commentcount/{postId}")]
        public async Task<ActionResult> GetCommentCountByPost(int postId)
        {
            var results = await _commentService.GetCommentsCountByPostIdAsync(postId);
            return Ok(results);
        }

        [Authorize(Roles = "HR")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteComment(int id, [FromBody] DeleteCommentRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Reason))
                return BadRequest("A reason for removal is required.");

            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();

            int hrUserId = int.Parse(userIdClaim);
            bool isHr = User.IsInRole("HR");

            var comment = await _commentService.DeleteCommentAsync(id, hrUserId, isHr);

            if (comment == null) return NotFound("Comment not found or unauthorized.");

            if (comment.Author != null && !string.IsNullOrEmpty(comment.Author.Email))
            {
                try
                {
                    var subject = $"Action Required: Your comment on '{comment.Post?.Title}' has been removed";
                    var body = $@"Hello, 

                    Your comment '{comment.Comment}' was removed by the HR department.

                    Reason for Removal: {request.Reason}

                    Date: {DateTime.UtcNow:f} UTC";

                    await _emailService.SendEmailAsync(comment.Author.Email, subject, body);
                }
                catch (Exception ex)
                {
                    // Log email failure but don't stop the HTTP success response
                    Console.WriteLine($"Email Error: {ex.Message}");
                }
            }

            return Ok("Comment Deleted Successfully");
        }
    }
}
