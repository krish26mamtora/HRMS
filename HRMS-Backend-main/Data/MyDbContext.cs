using HRMS_Backend.Entities;
using HRMS_Backend.Entities.Achievements;
using HRMS_Backend.Entities.Games_Scheduling;
using HRMS_Backend.Entities.JobListing;
using HRMS_Backend.Entities.TravelandExpense;
using HRMS_Backend.Entities.FixEntityUserProfile;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.Security.Cryptography.X509Certificates;
using TravelDocuments = HRMS_Backend.Entities.TravelandExpense.TravelDocuments;
using ShareEmail = HRMS_Backend.Entities.JobListing.ShareEmail;
using HRMS_Backend.Entities.GamesScheduling;
using AchievementNotification = HRMS_Backend.Entities.Achievements.AchievementNotification;

namespace HRMS_Backend.Data
{
    public class MyDbContext : DbContext
    {

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>()
                .HasOne(u => u.UserProfile)
                .WithOne(up => up.User)
                .HasForeignKey<UserProfile>(up => up.UserProfileId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<UserProfile>()
                .HasOne(u => u.Manager)
                .WithMany()
                .HasForeignKey(u => u.ManagerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Jobs>()
                .HasOne(j => j.User)
                .WithMany()
                .HasForeignKey(j => j.ManagedBy)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Referals>()
                .HasOne(r => r.Job)
                .WithMany(r => r.Referals)
                .HasForeignKey(r => r.JobId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Referals>()
                .HasOne(r => r.User)
                .WithMany()
                .HasForeignKey(r => r.EmpId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ShareEmail>()
                .HasOne(r => r.Job)
                .WithMany(r => r.ShareEmail)
                .HasForeignKey(r => r.JobId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ShareEmail>()
                .HasOne(r => r.User)
                .WithMany()
                .HasForeignKey(r => r.EmpId)
                .OnDelete(DeleteBehavior.Restrict);


            modelBuilder.Entity<TravelPlan>()
                .HasOne(tp => tp.User)
                .WithMany()
                .HasForeignKey(tp => tp.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<TravelAssignment>()
                .HasOne(tp => tp.TravelPlan)
                .WithMany(tp => tp.TravelAssignment)
                .HasForeignKey(ta => ta.PId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<TravelAssignment>()
                .HasOne(ta => ta.User)
                .WithMany()
                .HasForeignKey(ta => ta.EmpId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Expenses>()
                .HasOne(ep => ep.TravelPlan)
                .WithMany(ep => ep.Expenses)
                .HasForeignKey(ep => ep.TravelId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Expenses>()
                .HasOne(ep => ep.User)
                .WithMany()
                .HasForeignKey(ep => ep.EmplId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<BookingParticipants>()
                .HasOne(bp => bp.User)
                .WithMany()
                .HasForeignKey(bp => bp.EmpId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<BookingParticipants>()
                .HasOne(bp => bp.Bookings)
                .WithMany()
                .HasForeignKey(bp => bp.BookingId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<WaitingQueue>()
                .HasOne(wq => wq.GameCycle)
                .WithMany()
                .HasForeignKey(wq => wq.CycleId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<WaitingQueue>()
                .HasOne(wq => wq.GameSlots)
                .WithMany()
                .HasForeignKey(wq => wq.SlotId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<WaitingQueue>()
                .HasOne(wq => wq.User)
                .WithMany()
                .HasForeignKey(wq => wq.PlayerId)
               .OnDelete(DeleteBehavior.Restrict);


            modelBuilder.Entity<GameSlots>()
                .HasOne(gs => gs.GameCycle)
                .WithMany()
                .HasForeignKey(gs => gs.CycleId)
                .OnDelete(DeleteBehavior.Restrict);


            modelBuilder.Entity<Posts>()
               .HasOne(p => p.Author)
               .WithMany()
               .HasForeignKey(p => p.UserId)
               .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Posts>()
              .HasOne(p => p.Deleter)
              .WithMany()
              .HasForeignKey(p => p.DeletedByUserId)
              .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Comments>()
                   .HasOne(c => c.ParentComment)
                   .WithMany(c => c.Replies)
                   .HasForeignKey(c => c.ParentCommentId)
                   .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Comments>()
               .HasOne(c => c.Author)
               .WithMany()
               .HasForeignKey(c => c.AuthorId)
               .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<PostImages>()
                  .HasOne(i => i.Post)
                  .WithMany(p => p.PostImages)
                  .HasForeignKey(i => i.PostId)
                  .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PostInteraction>()
                 .HasIndex(e => e.PostId)
                 .IsUnique();

            modelBuilder.Entity<PostInteraction>()
                .HasOne(i => i.Post)
                .WithOne(p => p.PostInteraction)
                .HasForeignKey<PostInteraction>(i => i.PostId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PostTagMap>()
                .HasIndex(pt => new { pt.PostId, pt.TagId })
                .IsUnique();

            modelBuilder.Entity<PostTagMap>()
                .HasOne(pt => pt.Post)
                .WithMany(p => p.PostTagMaps)
                .HasForeignKey(pt => pt.PostId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PostTagMap>()
                  .HasOne(pt => pt.Tag)
                 .WithMany(t => t.PostTagMaps)
                 .HasForeignKey(pt => pt.TagId)
                 .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PostModerationLog>()
                .HasOne(m => m.Moderator)
                .WithMany()
                .HasForeignKey(m => m.ModeratedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<PostModerationLog>()
                .HasOne(m => m.TargetUser)
               .WithMany()
               .HasForeignKey(m => m.TargetUserId)
               .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<AchievementNotification>()
               .HasOne(n => n.User)
              .WithMany()
              .HasForeignKey(n => n.UserId)
              .OnDelete(DeleteBehavior.Cascade);

        }
        public MyDbContext(DbContextOptions<MyDbContext> options) : base(options)
        {
        }
        public DbSet<User> Users { get; set; }
        public DbSet<Games> Games { get; set; }
        public DbSet<GameConfiguration> GameConfiguration { get; set; }
        public DbSet<GameSlots> GameSlots { get; set; }
        public DbSet<Jobs> Jobs { get; set; }
        public DbSet<Tags> Tags { get; set; }
        public DbSet<AchievementNotification> Notifications { get; set; }
        public DbSet<TravelPlan> TravelPlan { get; set; }
        public DbSet<Referals> Referals { get; set; }
        public DbSet<TravelAssignment> TravelAssignment { get; set; }
        public DbSet<UserProfile> UserProfile { get; set; }
        public DbSet<ShareEmail> ShareEmail { get; set; }
        public DbSet<Expenses> Expenses { get; set; }
        public DbSet<TravelExpense> TravelExpense { get; set; }
        public DbSet<ExpenseProof> ExpenseProof { get; set; }
        public DbSet<ExpensePolicy> ExpensePolicy { get; set; }
        public DbSet<TravelDocuments> TravelDocuments { get; set; }
        public DbSet<TravelAssignEmail> TravelAssignEmail { get; set; }
        public DbSet<ExpenseCreateEmail> ExpenseCreateEmail { get; set; }
        public DbSet<GameCycle> GameCycle { get; set; }
        public DbSet<EmployeeCycleStats> EmployeeCycleStats { get; set; }
        public DbSet<Bookings> Bookings { get; set; }
        public DbSet<WaitingQueue> WaitingQueue { get; set; }
        public DbSet<BookingParticipants> BookingParticipants { get; set; }
        public DbSet<AchievementNotification> AchievementNotification { get; set; }
        public DbSet<Comments> Comments { get; set; }
        public DbSet<PostInteraction> PostInteraction { get; set; }
        public DbSet<PostModerationLog> PostModerationLog { get; set; }
        public DbSet<Posts> Posts { get; set; }
        public DbSet<PostTagMap> PostTagMaps { get; set; }
        public DbSet<PostImages> PostImages { get; set; }
        public DbSet<BookingInvite> BookingInvite { get; set; }
        public DbSet<UserPostReaction> UserPostReaction { get; set; }
        public DbSet<InAppNotification> InAppNotifications { get; set; }

    }

}
