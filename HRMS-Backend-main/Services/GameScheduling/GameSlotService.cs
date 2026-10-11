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
                var gameConfig = await _context.GameConfiguration.FirstOrDefaultAsync(gc => gc.GamesId == gamesId);
                if (gameConfig == null)
                {
                    throw new InvalidOperationException($"Game {gamesId} has no slot configuration.");
                }
                if (gameConfig.SlotDuration <= 0 || gameConfig.StartTime >= gameConfig.OverTime)
                {
                    throw new InvalidOperationException($"Game {gamesId} has an invalid slot configuration.");
                }

                var activeCycle = await _context.GameCycle
                    .Where(gc => gc.GamesId == gamesId && gc.isActive)
                    .OrderByDescending(gc => gc.StartTime)
                    .ThenByDescending(gc => gc.CycleId)
                    .FirstOrDefaultAsync();

                if (activeCycle == null)
                {
                    throw new InvalidOperationException($"Game {gamesId} has no active cycle.");
                }

                var indiaTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Asia/Kolkata");
                var cycleStartLocal = TimeZoneInfo.ConvertTimeFromUtc(
                    DateTime.SpecifyKind(activeCycle.StartTime, DateTimeKind.Utc),
                    indiaTimeZone);
                var cycleEndLocal = TimeZoneInfo.ConvertTimeFromUtc(
                    DateTime.SpecifyKind(activeCycle.EndTime, DateTimeKind.Utc),
                    indiaTimeZone);
                DateOnly cycleStartDate = DateOnly.FromDateTime(cycleStartLocal);
                DateOnly cycleEndDate = DateOnly.FromDateTime(cycleEndLocal);

                var slotDuration = gameConfig.SlotDuration;
                var dayStartTime = gameConfig.StartTime;
                var dayEndTime = gameConfig.OverTime;

                var existingStartTimes = await _context.GameSlots
                    .Where(slot => slot.GamesId == gamesId && slot.CycleId == activeCycle.CycleId)
                    .Select(slot => slot.StartTime)
                    .ToListAsync();
                var existingStartTimeSet = existingStartTimes.ToHashSet();
                var slotToInsert = new List<GameSlots>();


                for (DateOnly currentDate = cycleStartDate; currentDate <= cycleEndDate; currentDate = currentDate.AddDays(1))
                {
                    TimeOnly currentStart = dayStartTime;

                    while (currentStart.AddMinutes(slotDuration) <= dayEndTime)
                    {
                        var localSlotStart = DateTime.SpecifyKind(
                            currentDate.ToDateTime(currentStart),
                            DateTimeKind.Unspecified);

                        var localSlotEnd = localSlotStart.AddMinutes(slotDuration);

                        var slotStartDateTime = TimeZoneInfo.ConvertTimeToUtc(
                            localSlotStart, indiaTimeZone);

                        var slotEndDateTime = TimeZoneInfo.ConvertTimeToUtc(
                            localSlotEnd, indiaTimeZone);
                        if (!existingStartTimeSet.Contains(slotStartDateTime))
                        {
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
                        }

                        currentStart = currentStart.AddMinutes(slotDuration);
                    }
                }

                if (slotToInsert.Any())
                {
                    await _context.GameSlots.AddRangeAsync(slotToInsert);
                    await _context.SaveChangesAsync();
                }
                await transaction.CommitAsync();
                return slotToInsert.Count;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<IEnumerable<GameSlotsDisplayDto>> GetAllGamesSlotAsync()
        {
            var slots = await _context.GameSlots
                .ToListAsync();
            return await MapSlotsWithCurrentAssignmentsAsync(slots);
        }

        public async Task<IEnumerable<GameSlotsDisplayDto>>
            GetGamesSlotForGameAndDateAsync(int id, DateTime dt)
        {
            var indiaTimeZone =
                TimeZoneInfo.FindSystemTimeZoneById("Asia/Kolkata");

            // Treat the requested date as an India-local date.
            var localStart = DateTime.SpecifyKind(
                dt.Date, DateTimeKind.Unspecified);

            var localEnd = localStart.AddDays(1);

            // Convert the day's boundaries to UTC.
            var startUtc = TimeZoneInfo.ConvertTimeToUtc(
                localStart, indiaTimeZone);

            var endUtc = TimeZoneInfo.ConvertTimeToUtc(
                localEnd, indiaTimeZone);

            var slots = await _context.GameSlots
                .Where(gs =>
                    gs.GamesId == id &&
                    gs.StartTime >= startUtc &&
                    gs.StartTime < endUtc)
                .ToListAsync();

            return await MapSlotsWithCurrentAssignmentsAsync(slots);
        }

        private async Task<IEnumerable<GameSlotsDisplayDto>> MapSlotsWithCurrentAssignmentsAsync(
            List<GameSlots> slots)
        {
            var slotIds = slots.Select(slot => slot.Id).ToList();
            var assignedBySlot = await (
                from participant in _context.BookingParticipants.AsNoTracking()
                join booking in _context.Bookings.AsNoTracking()
                    on participant.BookingId equals booking.BId
                where slotIds.Contains(booking.SlotId) &&
                    (booking.Status == "Booked" || booking.Status == "Confirmed")
                group participant by booking.SlotId into slotParticipants
                select new
                {
                    SlotId = slotParticipants.Key,
                    Assigned = slotParticipants.Count()
                })
                .ToDictionaryAsync(result => result.SlotId, result => result.Assigned);

            var slotDtos = _mapper.Map<List<GameSlotsDisplayDto>>(slots);
            for (var index = 0; index < slots.Count; index++)
            {
                slotDtos[index].Assigned = assignedBySlot.GetValueOrDefault(slots[index].Id);
            }

            return slotDtos;
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
