using AutoMapper;
using HRMS_Backend.Data;
using HRMS_Backend.Entities.Achievements;
using HRMS_Backend.Mapper;
using HRMS_Backend.Model.Achievements;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking.Internal;
using Org.BouncyCastle.Asn1.Cms;

namespace HRMS_Backend.Services.Achievements
{
    public class CommentService : ICommentService
    {
        private readonly MyDbContext _context;
        private readonly IMapper _mapper;
        public CommentService(MyDbContext context,  IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<CommentsDisplayDto> CreateOrUpdateCommentAsync(int userId, CommentsCreateUpdateDto dto)
        {
            if (dto == null) throw new ArgumentNullException(nameof(dto));

            Comments? comment = null;

            if (dto.Id.HasValue && dto.Id > 0)
            {
                comment = await _context.Comments
                 .FirstOrDefaultAsync(c => c.Id == dto.Id && c.AuthorId == userId && !c.IsDeleted);

                if (comment == null) throw new Exception("Comment not found or unauthorized.");

                comment.Comment = dto.Comment; 
                comment.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                comment = new Comments
                {
                    PostsId = dto.PostId,
                    AuthorId = userId,
                    Comment = dto.Comment,
                    ParentCommentId = dto.ParentCommentId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    IsDeleted = false
                };
                _context.Comments.Add(comment);
            }
             await _context.SaveChangesAsync();


            var result = await GetCommentByIdAsync(comment.Id);
            return _mapper.Map<CommentsDisplayDto>(result);
        }


        public async Task<CommentsDisplayDto> GetCommentByIdAsync(int id)
        {
            var comment = await _context.Comments
            .Include(c => c.Author) 
            .Include(c => c.Replies.Where(r => !r.IsDeleted))
                .ThenInclude(r => r.Author)
            .FirstOrDefaultAsync(c => c.Id == id);  
            return _mapper.Map<CommentsDisplayDto>(comment);
        }
        public async Task<int> GetCommentsCountByPostIdAsync(int id)
        {
            return await _context.Comments.Where(c => c.IsDeleted == false && c.PostsId == id).CountAsync();
        }
       
        public async Task<List<CommentsDisplayDto>> GetCommentsByPostIdAsync(int postId)
        {
            var comments = await _context.Comments
                .Where(c => c.PostsId == postId && c.ParentCommentId == null && !c.IsDeleted)
                .Include(c => c.Author)
                .Include(c => c.Replies.Where(r => !r.IsDeleted)).ThenInclude(r => r.Author)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();

            return _mapper.Map<List<CommentsDisplayDto>>(comments);
        }

        public async Task<Comments?> DeleteCommentAsync(int id, int userId, bool isHr)
        {
            // Eager Load Author and Post for the email logic
            var comment = await _context.Comments
                .Include(c => c.Author)
                .Include(c => c.Post)
                .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);

            if (comment == null) return null;

            // Check if user is Author OR if user has the HR role
            if (comment.AuthorId != userId && !isHr) return null;

            comment.IsDeleted = true;
            comment.DeletedByUserId = userId;
            comment.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return comment;
        }
    }
}
