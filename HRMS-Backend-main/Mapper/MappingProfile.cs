using AutoMapper;
using HRMS_Backend.Entities.Achievements;
using HRMS_Backend.Entities.FixEntityUserProfile;
using HRMS_Backend.Entities.Games_Scheduling;
using HRMS_Backend.Entities.GamesScheduling;
using HRMS_Backend.Entities.JobListing;
using HRMS_Backend.Entities.TravelandExpense;
using HRMS_Backend.Model.Achievements;
using HRMS_Backend.Model.DtoUserProfile;
using HRMS_Backend.Model.GameScheduling;
using HRMS_Backend.Model.JobListing;
using HRMS_Backend.Model.TravelandExpense;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;

namespace HRMS_Backend.Mapper
{
    public class MappingProfile : Profile
    {
        public MappingProfile() {
            CreateMap<TravelPlan, TravelResponseDto>();
            CreateMap<Jobs, JobResponseDto>();
            CreateMap<Referals, JobRefferalResponseDto>();
            CreateMap<TravelAssignment, TravelAssignmentDisplayDto>();
            CreateMap<UserProfileCreateUpdateDto, UserProfile>();
            CreateMap<UserProfile, UserProfileDisplayDto>();
            CreateMap<UserProfileDisplayDto, UserProfile>();
            CreateMap<TravelExpense, ExpenseDisplayDto>();
            CreateMap<ExpenseCreateUpdateDto, TravelExpense>();
            CreateMap<Expenses, ExpenseDisplayDto>();
            CreateMap<ExpenseProof, ExpenseProofDisplayDto>();
            CreateMap<TravelDocuments, TravelDocumentsDisplayDto>();
            CreateMap<Games, GamesDisplayDto>();
            CreateMap<GameConfiguration, GameConfigDisplayDto>();
            CreateMap<GameSlots, GameSlotsDisplayDto>();
            CreateMap<EmployeeCycleStats, EmployeeCycleStatsDisplayDto>();
            CreateMap<GameCycle, GameCycleDisplayDto>();
            CreateMap<Bookings, BookingsDisplayDto>();
            CreateMap<Posts, PostsCreateUpdateDto>();
            CreateMap<PostInteraction, PostInteractionDisplayDto>();
            CreateMap<BookingParticipants, BookingsDisplayDto>();
            CreateMap<PostsCreateUpdateDto, Posts>();
            CreateMap<WaitingQueue, WaitingQueueDisplayDto>();
            CreateMap<GameConfigCreateUpdateDto, GameConfiguration>();
            CreateMap<Tags, TagsDisplayDto>();
            CreateMap<Posts, PostsDisplayDto>()
               .ForMember(dest => dest.AuthorName, opt => opt.MapFrom(src => src.Author.Email))
               .ForMember(dest => dest.ImageUrls, opt => opt.MapFrom(src =>
                   src.PostImages.Select(i => i.ImagePath).ToList()))
               .ForMember(dest => dest.TagNames, opt => opt.MapFrom(src =>
                   src.PostTagMaps.Select(ptm => ptm.Tag.TagName).ToList()))
               .ForMember(dest => dest.PostInteraction, opt => opt.MapFrom(src => src.PostInteraction));

            CreateMap<Comments, CommentsDisplayDto>()
          .ForMember(dest => dest.AuthorEmail, opt => opt.MapFrom(src => src.Author.Email))
          .ForMember(dest => dest.Replies, opt => opt.MapFrom(src => src.Replies))
          .MaxDepth(3);
        }
    }
}
