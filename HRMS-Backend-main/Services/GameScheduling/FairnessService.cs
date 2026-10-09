using AutoMapper;
using HRMS_Backend.Data;

using HRMS_Backend.Services.ServiceUserProfile;
using Microsoft.EntityFrameworkCore;
using static HRMS_Backend.Services.GameScheduling.BookingService;

namespace HRMS_Backend.Services.GameScheduling
{
    public class FairnessService : IFairnessService
    {
        private readonly MyDbContext _context;
        private readonly IUserProfileService _userProfileService;
        private readonly IEmployeeCycleStatsService _employeeCycleStatsService;
        private readonly IGameCycleService _gameCycleService;

        public FairnessService(
            MyDbContext context,
            IUserProfileService userProfileService,
            IEmployeeCycleStatsService employeeCycleStatsService,
            IGameCycleService gameCycleService)
        {
            _context = context;
            _userProfileService = userProfileService;
            _employeeCycleStatsService = employeeCycleStatsService;
            _gameCycleService = gameCycleService;
        }

        public async Task<(bool IsRejected, string Message)> IsHardRejectedAsync(int userId, int slotId)
        {
            if (await _userProfileService.IsUserBannedAsync(userId))
                return (true, "User is banned");

            var slot = await _context.GameSlots.Include(s => s.Games)
                .FirstOrDefaultAsync(s => s.Id == slotId);

            if (slot == null)
                return (true, "Invalid slot");

            var interestedGame = await _userProfileService.GetGameInterestedByIdAsync(userId);

            if (slot.Games.Name != interestedGame)
                return (true, "You can only book your interested game");
            var targetDayStart = slot.StartTime.Date;
            var targetDayEnd = targetDayStart.AddDays(1);


            bool alreadyBookedOnThatDay = await _context.BookingParticipants
                .Where(p => p.EmpId == userId && (p.Bookings.Status == "Booked" || p.Bookings.Status == "Confirmed"))
                .AnyAsync(p =>
                p.Bookings.GameSlots.StartTime >= targetDayStart &&
                p.Bookings.GameSlots.StartTime < targetDayEnd);

            if (alreadyBookedOnThatDay)
                return (true, $"You already have a booking for {targetDayStart:yyyy-MM-dd}. Only one slot per day is allowed.");

            return (false, "");
        }
        public async Task<bool> IsEligibleForDirectBookingAsync(int userId, int cycleId)
        {
            var lowestPlayed = await _gameCycleService
                .getLowsetGamePlayedInCurrentCycle(cycleId);

            var stats = await _employeeCycleStatsService
                .GetUserCycleStatsAsync(userId, cycleId);

            int userPlayed = stats?.GamePlayed ?? 0;

            return userPlayed <= lowestPlayed;
        }


        public async Task<int> GetUserPriorityAsync(int userId, int cycleId)
        {
            var stats = await _employeeCycleStatsService
                .GetUserCycleStatsAsync(userId, cycleId);

            return stats?.GamePlayed ?? 0;
        }
    }

}