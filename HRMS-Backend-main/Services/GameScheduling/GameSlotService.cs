using AutoMapper;
using HRMS_Backend.Data;
using HRMS_Backend.Entities.Games_Scheduling;
using HRMS_Backend.Model.GameScheduling;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace HRMS_Backend.Services.GameScheduling
{
    public class GameSlotService : IGameSlotService
    {
        private readonly MyDbContext _context;
        private readonly IMapper _mapper;
        private readonly IGameCycleService _gameCycleService;
        public GameSlotService(MyDbContext context, IMapper mapper, IGameCycleService gameCycleService)
        {
            _context = context;
            _mapper = mapper;
            _gameCycleService = gameCycleService;
        }
        public async Task<int?> GenerateGameSlotAsync(int gamesId, DateOnly ignoredDate)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                int totalSlotAdded = 0;

                var gameConfig = await _context.GameConfiguration.FirstOrDefaultAsync(gc => gc.GamesId == gamesId);
                if (gameConfig == null) return null;

                var activeCycle = await _context.GameCycle
                    .FirstOrDefaultAsync(gc => gc.GamesId == gamesId && gc.isActive);

                if (activeCycle == null) return null;

                DateOnly cycleStartDate = DateOnly.FromDateTime(activeCycle.StartTime);
                DateOnly cycleEndDate = DateOnly.FromDateTime(activeCycle.EndTime);

                var slotDuration = gameConfig.SlotDuration;
                var dayStartTime = gameConfig.StartTime;
                var dayEndTime = gameConfig.OverTime;

                var slotToInsert = new List<GameSlots>();


                for (DateOnly currentDate = cycleStartDate; currentDate <= cycleEndDate; currentDate = currentDate.AddDays(1))
                {
                    TimeOnly currentStart = dayStartTime;

                    while (currentStart.AddMinutes(slotDuration) <= dayEndTime)
                    {
                        var slotStartDateTime = currentDate.ToDateTime(currentStart);
                        var slotEndDateTime = slotStartDateTime.AddMinutes(slotDuration);

                        slotToInsert.Add(new GameSlots
                        {
                            GamesId = gamesId,
                            StartTime = slotStartDateTime,
                            EndTime = slotEndDateTime,
                            Capacity = gameConfig.Capacity,
                            Assigned = 0,
                            CycleId = activeCycle.CycleId,
                            IsBookingOpen = true,
                            SlotPlayed = false
                        });

                        currentStart = currentStart.AddMinutes(slotDuration);
                        totalSlotAdded++;
                    }
                }

                if (slotToInsert.Any())
                {
                    await _context.GameSlots.AddRangeAsync(slotToInsert);
                    await _context.SaveChangesAsync();
                }
                await transaction.CommitAsync();
                return totalSlotAdded;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<IEnumerable<GameSlotsDisplayDto>> GetAllGamesSlotAsync()
        {
            var slots = await _context.GameSlots.ToListAsync();
            return _mapper.Map<IEnumerable<GameSlotsDisplayDto>>(slots);
        }
        public async Task<IEnumerable<GameSlotsDisplayDto>> GetGamesSlotForGameAndDateAsync(int id, DateTime dt)
        {
            dt = dt.Date;
            var slots = await _context.GameSlots.Where(gs => gs.GamesId == id && gs.StartTime.Date == dt.Date).ToListAsync();
            return _mapper.Map<IEnumerable<GameSlotsDisplayDto>>(slots);

        }
        public async Task<Boolean> CompleteSlotAsync(int slotId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var slot = await _context.GameSlots.Include(s => s.Bookings).ThenInclude(s => s.BookingParticipants).FirstOrDefaultAsync(s => s.Id == slotId);

                if (slot == null)
                {
                    throw new Exception("Slot not found");
                }
                if (slot.SlotPlayed)
                {
                    throw new Exception("Slot already completed");
                }

                slot.SlotPlayed = true;

                var confirmedBookings = slot.Bookings.Where(b => b.Status == "Confirmed").ToList();

                var playedUserIds = confirmedBookings.SelectMany(b => b.BookingParticipants).Select(p => p.EmpId).Distinct().ToList();

                var stats = await _context.EmployeeCycleStats.Where(x => x.GameCycleId == slot.CycleId && playedUserIds.Contains(x.UserId)).ToListAsync();

                foreach (var stat in stats)
                {
                    stat.GamePlayed++;
                }

                foreach (var booking in confirmedBookings)
                {
                    booking.Status = "Completed";
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

    }
}
