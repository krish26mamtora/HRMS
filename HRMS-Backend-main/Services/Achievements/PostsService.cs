using AutoMapper;
using HRMS_Backend.Data;
using HRMS_Backend.Entities;
using HRMS_Backend.Entities.Achievements;
using HRMS_Backend.Model.Achievements;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using System.ComponentModel.DataAnnotations.Schema;

namespace HRMS_Backend.Services.Achievements
{
    public class PostsService : IPostsService
    {

        private readonly MyDbContext _context;
        private readonly IMapper _mapper;
        private readonly IWebHostEnvironment _hostingEnvironment;

        public PostsService(MyDbContext context, IMapper mapper, IWebHostEnvironment hostingEnvironment)
        {
            _context = context;
            _mapper = mapper;
            _hostingEnvironment = hostingEnvironment;
        }
        public async Task<PostsDisplayDto> CreatePostAsync(PostsCreateUpdateDto dto, int userId)
        {
            if (dto == null) throw new ArgumentNullException(nameof(dto));
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var post = _mapper.Map<Posts>(dto);
                post.UserId = userId;
                post.CreatedAt = DateTime.UtcNow;
                post.IsVisible = true;
                post.IsSystemGenerated = false;

                _context.Posts.Add(post);
                await _context.SaveChangesAsync();

                if (dto.Images != null && dto.Images.Count > 0)
                {
                    foreach (var file in dto.Images)
                    {
                        string uniqueFileName = Guid.NewGuid().ToString() + "_" + file.FileName;
                        string filePath = Path.Combine("AchievementImages", uniqueFileName);
                        using (var fileStream = new FileStream(filePath, FileMode.Create))
                        {
                            await file.CopyToAsync(fileStream);
                        }
                        _context.PostImages.Add(new PostImages
                        {
                            PostId = post.Id,
                            ImagePath = uniqueFileName
                        });
                    }
                }

                _context.PostInteraction.Add(new PostInteraction { PostId = post.Id, LastUpdatedAt = DateTime.UtcNow });
                if (dto.TagIds != null && dto.TagIds.Any())
                {
                    foreach (var tagId in dto.TagIds)
                    {
                        _context.PostTagMaps.Add(new PostTagMap { PostId = post.Id, TagId = tagId });
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return await GetPostByIdAsync(post.Id);

            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
        public async Task<PostsDisplayDto> GetPostByIdAsync(int id)
        {
            var post = await _context.Posts
                .Include(p => p.Author)
                .Include(p => p.PostImages)
                .Include(p => p.PostTagMaps).ThenInclude(pt => pt.Tag)
                .Include(p => p.PostInteraction)
                .FirstOrDefaultAsync(p => p.Id == id);

            return  _mapper.Map<PostsDisplayDto>(post);
        }
        public async Task<List<PostsDisplayDto>> getFeedItemsAsync(int pageNumber , int pageSize)
        {
            int skip = (pageNumber - 1) * pageSize;
            var posts = await _context.Posts.Where(p => p.IsVisible && p.DeletedByUserId == null)
                    .Include(p => p.Author).Include(p => p.PostImages)
                     .Include(p => p.PostTagMaps).ThenInclude(pt => pt.Tag)
                    .Include(p => p.PostInteraction).OrderByDescending(p => p.CreatedAt)
                    .Skip(skip).Take(pageSize).ToListAsync(); 
            return _mapper.Map<List<PostsDisplayDto>>(posts);
        }
        public async Task<List<PostsDisplayDto>> GetAllPostsAsync()
        {
            var posts = await _context.Posts
                .Where(p => p.IsVisible && p.DeletedByUserId == null)
                .Include(p => p.Author)
                .Include(p => p.PostInteraction)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            return _mapper.Map<List<PostsDisplayDto>>(posts);
        }
        public async Task<bool> UpdatePostAsync(int id, PostsCreateUpdateDto dto)
        {
            var post = await _context.Posts
                .Include(p => p.PostTagMaps)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (post == null) return false;

            _mapper.Map(dto, post);
            post.UpdatedAt = DateTime.UtcNow;

            _context.PostTagMaps.RemoveRange(post.PostTagMaps);
            if (dto.TagIds != null && dto.TagIds.Any())
            {
                foreach (var tagId in dto.TagIds)
                {
                    _context.PostTagMaps.Add(new PostTagMap { PostId = id, TagId = tagId });
                }
            }

            if (dto.Images != null && dto.Images.Count > 0)
            {
                string folderPath = Path.Combine(Directory.GetCurrentDirectory(), "AchievementImages");
                if (!Directory.Exists(folderPath)) Directory.CreateDirectory(folderPath);

                foreach (var file in dto.Images)
                {
                    string uniqueFileName = Guid.NewGuid().ToString() + "_" + file.FileName;
                    string filePath = Path.Combine(folderPath, uniqueFileName);

                    using (var fileStream = new FileStream(filePath, FileMode.Create))
                    {
                        await file.CopyToAsync(fileStream);
                    }

                    _context.PostImages.Add(new PostImages
                    {
                        PostId = id,
                        ImagePath = uniqueFileName
                    });
                }
            }

            try
            {
                return await _context.SaveChangesAsync() > 0;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        public async Task<Posts?> SoftDeletePostAsync(int id, int userId, string reason)
        {
            //var post = await _context.Posts.FindAsync(id);

            var post = await _context.Posts
               .Include(p => p.Author)
               .FirstOrDefaultAsync(p => p.Id == id);

            //if (post == null) return false;
            post.IsVisible = false;
            post.DeletedByUserId = userId;

            _context.PostModerationLog.Add(new PostModerationLog
            {
                EntityType = "Post",
                EntityId = id,
                Action = "SoftDelete",
                Reason = reason,
                ModeratedByUserId = userId,
                TargetUserId = post.UserId??0,
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
            return post;
        }
        public async Task<bool> SoftDeleteOwnPostAsync(int id, int userId)
        {
            var post = await _context.Posts.FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

            if (post == null) return false;

            post.IsVisible = false;
            post.UpdatedAt = DateTime.UtcNow;
            post.DeletedByUserId = userId; 

            _context.PostModerationLog.Add(new PostModerationLog
            {
                EntityType = "Post",
                EntityId = id,
                Action = "UserSoftDelete",
                Reason = "Deleted by Owner",
                ModeratedByUserId = userId,
                TargetUserId = userId,
                CreatedAt = DateTime.UtcNow
            });

            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<PostsDisplayDto>> GetAllVisiblePostsAsync()
        {
            var posts = await _context.Posts
               .Where(p => p.IsVisible && p.DeletedByUserId == null)
               .Include(p => p.Author)
               .Include(p => p.PostImages)
               .Include(p => p.PostTagMaps)
                   .ThenInclude(ptm => ptm.Tag)
      
               .Include(p => p.PostInteraction)
               .OrderByDescending(p => p.CreatedAt)
               .ToListAsync();
            return  _mapper.Map<List<PostsDisplayDto>>(posts);
        }
        public async Task<IEnumerable<PostsDisplayDto>> GetUserPostsHistoryAsync(int userId)
        {
            var posts = await _context.Posts
                .Where(p => p.UserId == userId) 
                .Include(p => p.Author)
                .Include(p => p.PostImages)
                .Include(p => p.PostTagMaps)
                    .ThenInclude(ptm => ptm.Tag)
                .Include(p => p.PostInteraction)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            return _mapper.Map<List<PostsDisplayDto>>(posts);
        }
        public async Task<int> GenerateSystemPosts()
        {
            DateTime now = DateTime.UtcNow;
            DateOnly todayDate = DateOnly.FromDateTime(now);

            var expiredPostIds = await _context.Posts
                .Where(p => p.IsSystemGenerated && p.ExpiresAt < now && p.IsVisible)
                .Select(p => p.Id)
                .ToListAsync();

            if (expiredPostIds.Any())
            {
                var postsToUpdate = await _context.Posts.Where(p => expiredPostIds.Contains(p.Id)).ToListAsync();
                foreach (var p in postsToUpdate) { p.IsVisible = false; }

                var commentsToUpdate = await _context.Comments.Where(c => expiredPostIds.Contains(c.PostsId)).ToListAsync();
                foreach (var c in commentsToUpdate) { c.IsDeleted = true; }

                await _context.SaveChangesAsync();
            }

            var birthdayUsers = await _context.UserProfile
                .Where(up => up.Birthday.Month == todayDate.Month && up.Birthday.Day == todayDate.Day)
                .ToListAsync();

            int createdCount = 0;
            foreach (var user in birthdayUsers)
            {
                var birthdayPost = new Posts
                {
                    UserId = user.UserProfileId,
                    Title = "Happy Birthday! 🎂",
                    Description = $"Wishing {user.FirstName} a wonderful birthday today!",
                    CreatedAt = now,
                    ExpiresAt = now.AddDays(1),
                    IsVisible = true,
                    IsSystemGenerated = true
                };

                _context.Posts.Add(birthdayPost);
                await _context.SaveChangesAsync();

                _context.PostTagMaps.Add(new PostTagMap { PostId = birthdayPost.Id, TagId = 4 });
                _context.PostInteraction.Add(new PostInteraction { PostId = birthdayPost.Id, LastUpdatedAt = now });

                createdCount++;
            }

            await _context.SaveChangesAsync();
            return createdCount;
        }

        public async Task<int> GenerateAnniversaryPosts()
        {
            DateTime now = DateTime.UtcNow;
            DateOnly todayDate = DateOnly.FromDateTime(now);
            int currentYear = now.Year;

            var expiredPostIds = await _context.Posts
                .Where(p => p.IsSystemGenerated && p.ExpiresAt < now && p.IsVisible)
                .Select(p => p.Id)
                .ToListAsync();

            if (expiredPostIds.Any())
            {
                var postsToHide = await _context.Posts.Where(p => expiredPostIds.Contains(p.Id)).ToListAsync();
                var commentsToDelete = await _context.Comments.Where(c => expiredPostIds.Contains(c.PostsId)).ToListAsync();

                postsToHide.ForEach(p => p.IsVisible = false);
                commentsToDelete.ForEach(c => c.IsDeleted = true);

                await _context.SaveChangesAsync();
            }

            var anniversaryUsers = await _context.UserProfile
                .Where(up => up.JoinDate.Month == todayDate.Month &&
                             up.JoinDate.Day == todayDate.Day &&
                             up.JoinDate.Year < currentYear)
                .ToListAsync();

            var newPosts = new List<Posts>();
            foreach (var user in anniversaryUsers)
            {
                int yearsCompleted = currentYear - user.JoinDate.Year;
                newPosts.Add(new Posts
                {
                    UserId = user.UserProfileId,
                    Title = "Work Anniversary! 🎊",
                    Description = $"Congratulations to {user.FirstName} for completing {yearsCompleted} years! 🚀",
                    CreatedAt = now,
                    ExpiresAt = now.AddDays(1),
                    IsVisible = true,
                    IsSystemGenerated = true
                });
            }

            _context.Posts.AddRange(newPosts);
            await _context.SaveChangesAsync();

            foreach (var post in newPosts)
            {
                _context.PostTagMaps.Add(new PostTagMap { PostId = post.Id, TagId = 5 });
                _context.PostInteraction.Add(new PostInteraction { PostId = post.Id, LastUpdatedAt = now });
            }

            await _context.SaveChangesAsync();
            return newPosts.Count;
        }
        public async Task<bool> ToggleReactionAsync(PostInteractionCreateUpdateDto dto, int userId)
        {
            var existingReaction = await _context.UserPostReaction
                .FirstOrDefaultAsync(r => r.PostId == dto.PostId &&
                                          r.UserId == userId &&
                                          r.ReactionType.ToLower() == dto.ReactionType.ToLower());

            var interaction = await _context.PostInteraction
                .FirstOrDefaultAsync(i => i.PostId == dto.PostId);

            if (interaction == null) return false;

            if (existingReaction != null)
            {
                _context.UserPostReaction.Remove(existingReaction);
                UpdateCounter(interaction, dto.ReactionType, -1);
            }
            else
            {
                var newReaction = new UserPostReaction
                {
                    PostId = dto.PostId,
                    UserId = userId,
                    ReactionType = dto.ReactionType
                };
                _context.UserPostReaction.Add(newReaction);
                UpdateCounter(interaction, dto.ReactionType, 1);
            }

            interaction.LastUpdatedAt = DateTime.UtcNow;
            return await _context.SaveChangesAsync() > 0;
        }
        private void UpdateCounter(PostInteraction interaction, string type, int adjustment)
        {
            switch (type.ToLower())
            {
                case "like": interaction.LikeCount = Math.Max(0, interaction.LikeCount + adjustment); break;
                case "celebrate": interaction.CelebrateCount = Math.Max(0, interaction.CelebrateCount + adjustment); break;
                case "love": interaction.LoveCount = Math.Max(0, interaction.LoveCount + adjustment); break;
                case "insightful": interaction.InsightfulCount = Math.Max(0, interaction.InsightfulCount + adjustment); break;
            }
        }
        public async Task<IEnumerable<TagsDisplayDto>> GetAllTagsAsync()
        {
            var tags = await _context.Tags
                .OrderBy(t => t.TagName)
                .ToListAsync();

            return _mapper.Map<IEnumerable<TagsDisplayDto>>(tags);
        }
        public async Task<(bool Success, string Message)> RestoreOwnPostAsync(int postId, int userId)
        {
            var post = await _context.Posts.FirstOrDefaultAsync(p => p.Id == postId && p.UserId == userId);

            if (post == null)
            {
                return (false, "Post not found."); 
            }

            if (post.DeletedByUserId != null && post.DeletedByUserId != userId)
            {
                return (false, "HR_Removed");
            }

            post.IsVisible = true;
            post.DeletedByUserId = null;

            await _context.SaveChangesAsync();
            return (true, "Restored");
        }
        public async Task<Posts> RestoreModeratedPostAsync(int postId, int hrUserId)
        {
            var post = await _context.Posts.Include(p => p.Author)
                .FirstOrDefaultAsync(p => p.Id == postId && p.DeletedByUserId == hrUserId);

            if (post == null)
            {
                return null;
            }
            post.IsVisible = true;
            post.DeletedByUserId = null;

            await _context.SaveChangesAsync();

            return post;
        }
        public async Task<IEnumerable<PostsDisplayDto>> GetModeratedPostsAsync(int hrUserId)
        {
            return await _context.Posts
                .Where(p => !p.IsVisible && p.DeletedByUserId == hrUserId)
                .OrderByDescending(p => p.CreatedAt) 
                .Select(p => new PostsDisplayDto
                {
                    Id = p.Id,
                    Title = p.Title,
                    Description = p.Description,
                    CreatedAt = p.CreatedAt,
                    IsVisible = p.IsVisible,
                    ImageUrls = p.PostImages.Select(img => img.ImagePath).ToList(),
                    AuthorName = p.Author.Email
                })
                .ToListAsync();
        }
    }
}