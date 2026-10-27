using AutoMapper;
using HRMS_Backend.Data;
using HRMS_Backend.Entities;
using HRMS_Backend.Entities.Games_Scheduling;
using HRMS_Backend.Entities.GamesScheduling;
using HRMS_Backend.Model.GameScheduling;
using HRMS_Backend.Services.Email;
using HRMS_Backend.Services.ServiceUserProfile;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System;
using System.Collections.Generic;
using System.Runtime.Intrinsics.X86;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace HRMS_Backend.Services.GameScheduling
{
    public class BookingService : IBookingService
    {
        private readonly MyDbContext _context;
        private readonly IMapper _mapper;
        private readonly IEmailService _emailService;
        private readonly IFairnessService _fairnessService;
        private readonly IGameSlotService _gameSlotService;
        private readonly IUserProfileService _userProfileService;
        private readonly IEmployeeCycleStatsService _employeeCycleStatsService;
        private readonly IGameCycleService _gameCycleService;
        public BookingService(MyDbContext context, IMapper mapper, IGameCycleService gameCycleService, IFairnessService fairnessService, IGameSlotService gameSlotService, IUserProfileService userProfileService, IEmployeeCycleStatsService employeeCycleStatsService, IEmailService emailService)
        {
            _context = context;
            _mapper = mapper;
            _fairnessService = fairnessService;
            _gameSlotService = gameSlotService;
            _userProfileService = userProfileService;
            _employeeCycleStatsService = employeeCycleStatsService;
            _emailService = emailService;
            _gameCycleService = gameCycleService;
        }
        public async Task<BookingResultDto> RequestBookingAsync(BookingRequestCreateDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var result = new BookingResultDto
                {
                    UserResults = new List<UserBookingDetail>(),
                    BookedUsers = new List<int>(),
                    WaitingUsers = new List<int>()
                };

                var slot = await _context.GameSlots
                    .Include(s => s.GameCycle)
                    .FirstOrDefaultAsync(s => s.Id == dto.SlotId);

                if (slot == null || !slot.IsBookingOpen)
                    throw new Exception("Slot unavailable");

                int availableSeats = slot.Capacity - slot.Assigned;

                var eligibleForBooking = new List<int>();
                var queueUsers = new List<int>();

                foreach (var userId in dto.userIds.Distinct())
                {

                    var (rejected, message) = await _fairnessService.IsHardRejectedAsync(userId, dto.SlotId);

                    if (rejected)
                    {
                        result.UserResults.Add(new UserBookingDetail
                        {
                            UserId = userId,
                            Status = "Failed",
                            Message = message
                        });
                        continue;
                    }

                    bool eligible =
                        await _fairnessService.IsEligibleForDirectBookingAsync(userId, slot.CycleId);

                    if (eligible && availableSeats > 0)
                    {
                        eligibleForBooking.Add(userId);
                        availableSeats--;

                        result.UserResults.Add(new UserBookingDetail
                        {
                            UserId = userId,
                            Status = "Booked",
                            Message = "Slot booked successfully"
                        });
                    }
                    else
                    {
                        queueUsers.Add(userId);

                        result.UserResults.Add(new UserBookingDetail
                        {
                            UserId = userId,
                            Status = "Waiting",
                            Message = eligible
                                ? "Slot full. Added to queue"
                                : "Not eligible now. Added to queue"
                        });
                    }
                }

                if (eligibleForBooking.Any())
                {
                    int bookedBy = eligibleForBooking.Contains(dto.BookedBy) ? dto.BookedBy : eligibleForBooking.First();

                    var booking = new Bookings
                    {
                        SlotId = dto.SlotId,
                        BookedBy = bookedBy,
                        Status = "Booked",
                        BookedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

                    await _context.Bookings.AddAsync(booking);
                    await _context.SaveChangesAsync();
                    foreach (var userId in eligibleForBooking)
                    {
                        await _context.BookingParticipants.AddAsync(
                            new BookingParticipants
                            {
                                BookingId = booking.BId,
                                EmpId = userId
                            });
                    }

                    slot.Assigned += eligibleForBooking.Count;
                    result.BookedUsers.AddRange(eligibleForBooking);
                }


                foreach (var userId in queueUsers)
                {
                    var existingQueueEntry = await _context.WaitingQueue.FirstOrDefaultAsync(q =>
                        q.PlayerId == userId &&
                        q.SlotId == dto.SlotId);

                    if (existingQueueEntry == null)
                    {
                        await _context.WaitingQueue.AddAsync(new WaitingQueue
                        {
                            PlayerId = userId,
                            SlotId = dto.SlotId,
                            CycleId = slot.CycleId,
                            Status = "Waiting",
                            InsertionTime = DateTime.UtcNow
                        });
                    }
                    else if (existingQueueEntry.Status != "Waiting")
                    {
                        existingQueueEntry.CycleId = slot.CycleId;
                        existingQueueEntry.Status = "Waiting";
                        existingQueueEntry.InsertionTime = DateTime.UtcNow;
                        existingQueueEntry.UpdationTime = DateTime.UtcNow;
                    }
                    result.WaitingUsers.Add(userId);
                }

                await _context.SaveChangesAsync();

                await transaction.CommitAsync();
                if (result.BookedUsers.Any())
                {
                    await NotifyBookedUsersAsync(result.BookedUsers, slot, dto.BookedBy);
                }
                return result;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
        public async Task CancelBookingAsync(int bookingId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var booking = await _context.Bookings.FirstOrDefaultAsync(b => b.BId == bookingId);

                if (booking == null)
                    throw new Exception("Booking not found");

                if (booking.Status != "Booked")
                    throw new Exception("Only booked slots can be cancelled");

                int participantCount = await _context.BookingParticipants.CountAsync(p => p.BookingId == booking.BId);

                var slot = await _context.GameSlots.FirstOrDefaultAsync(s => s.Id == booking.SlotId);
                Console.WriteLine($"After total participants Assigned : {slot.Assigned}");

                if (slot != null)
                {
                    slot.Assigned -= participantCount;
                    Console.WriteLine($"Before total participants Assigned : {slot.Assigned}");
                    if (slot.Assigned < 0) slot.Assigned = 0;

                }


                //var slot = booking.GameSlots;


                booking.Status = "Cancelled";
                booking.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                await PromoteFromWaitingQueueAsync(slot.Id);

                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
        private async Task PromoteFromWaitingQueueAsync(int slotId, bool sendEmail = true)
        {
            Console.Write($"Promoting ....+ {slotId}");

            var slot = await _context.GameSlots
                .FirstOrDefaultAsync(s => s.Id == slotId);


            if (slot == null)
                return;

            int availableSeats = slot.Capacity - slot.Assigned;

            Console.Write($"availableSeats ....+ {availableSeats}");

            if (availableSeats <= 0)
                return;

            var waitingList = await _context.WaitingQueue
                .Where(q => q.SlotId == slotId && q.Status == "Waiting")
                .ToListAsync();

            if (!waitingList.Any())
                return;

            var priorityList = new List<(WaitingQueue Queue, int Priority)>();

            foreach (var q in waitingList)
            {
                var (isRejected, _) = await _fairnessService
                    .IsHardRejectedAsync(q.PlayerId, slotId);

                if (isRejected)
                {
                    q.Status = "Removed";
                    continue;
                }

                var isEligible = await _fairnessService
                    .IsEligibleForDirectBookingAsync(q.PlayerId, slot.CycleId);
                if (!isEligible)
                {
                    continue;
                }

                int priority = await _fairnessService
                    .GetUserPriorityAsync(q.PlayerId, slot.CycleId);

                priorityList.Add((q, priority));
            }

            if (!priorityList.Any())
            {
                await _context.SaveChangesAsync();
                return;
            }

            var orderedQueue = priorityList
                .OrderBy(x => x.Priority)
                .ThenBy(x => x.Queue.InsertionTime)
                .Take(availableSeats)
                .ToList();

            if (!orderedQueue.Any())
                return;

            var newBooking = new Bookings
            {
                SlotId = slotId,
                BookedBy = orderedQueue.First().Queue.PlayerId,
                Status = "Booked",
                BookedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _context.Bookings.AddAsync(newBooking);
            await _context.SaveChangesAsync();

            var promotedUserIds = new List<int>();

            foreach (var item in orderedQueue)
            {
                await _context.BookingParticipants.AddAsync(new BookingParticipants
                {
                    BookingId = newBooking.BId,
                    EmpId = item.Queue.PlayerId
                });

                item.Queue.Status = "Promoted";
                promotedUserIds.Add(item.Queue.PlayerId);
            }

            slot.Assigned += promotedUserIds.Count;

            await _context.SaveChangesAsync();

            if (sendEmail && promotedUserIds.Any())
            {
                await NotifyBookedUsersAsync(promotedUserIds, slot, newBooking.BookedBy);
            }
        }
        public async Task<BookingsDisplayDto> getBookingById(int id)
        {
            var booking = await _context.Bookings
                .Include(b => b.BookingParticipants)
                .Include(b => b.GameSlots)
                .FirstOrDefaultAsync(b => b.BId == id);
            var bookingDto = _mapper.Map<BookingsDisplayDto>(booking);
            if (booking?.GameSlots != null)
            {
                bookingDto.SlotStartTime = booking.GameSlots.StartTime;
                bookingDto.SlotEndTime = booking.GameSlots.EndTime;
            }
            return bookingDto;
        }
        public async Task<IEnumerable<BookingsDisplayDto>> getBookingsByUserId(int id)
        {
            if (id <= 0) throw new ArgumentException("Invalid User ID", nameof(id));

            var bookingIds = await _context.BookingParticipants
                .Where(bp => bp.EmpId == id)
                .Select(bp => bp.BookingId)
                .Distinct()
                .ToListAsync();

            if (!bookingIds.Any()) return new List<BookingsDisplayDto>();

            var bookings = await _context.Bookings
                .Include(b => b.BookingParticipants)
                .Include(b => b.GameSlots)
                .Where(b => bookingIds.Contains(b.BId))
                .ToListAsync();

            return bookings.Select(booking =>
            {
                var bookingDto = _mapper.Map<BookingsDisplayDto>(booking);
                bookingDto.SlotStartTime = booking.GameSlots.StartTime;
                bookingDto.SlotEndTime = booking.GameSlots.EndTime;
                return bookingDto;
            });
        }

        private async Task NotifyBookedUsersAsync(List<int> userIds, GameSlots slot, int requesterId)
        {
            var requester = await _context.Users.FindAsync(requesterId);
            string requesterEmail = requester?.Email ?? "A Colleague";

            var usersToNotify = await _context.Users
                .Where(u => userIds.Contains(u.Id))
                .Select(u => new { u.Email })
                .ToListAsync();

            foreach (var user in usersToNotify)
            {
                if (string.IsNullOrEmpty(user.Email)) continue;

                try
                {
                    var subject = "Success: Your Game Slot is Booked!";

                    var body = $@"
                Slot Booking Confirmation
                
                Hello,

                Great news! Your slot has been successfully booked.

                --- Booking Details ---
                Slot: {slot.Bookings}
                Date: {slot.StartTime:dddd, dd MMMM yyyy}
                Time: {slot.StartTime:hh:mm tt} - {slot.EndTime:hh:mm tt}
                Booked By: {requesterEmail}

                --- Location/Instructions ---
                Please ensure you arrive 5 minutes before the start time.

                Date of Request: {DateTime.UtcNow:f} UTC

                If you cannot attend, please cancel your booking to allow others to play.";

                    await _emailService.SendEmailAsync(user.Email, subject, body);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error sending booking email to {user.Email}: {ex.Message}");
                }
            }
        }
        public async Task MarkSlotCompletedAsync(int slotId, int completedByUserId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            Console.WriteLine("MMMMMMMMMMM");
            Console.WriteLine($"{slotId} {completedByUserId}");
            try
            {
                var slot = await _context.GameSlots.Include(s => s.Bookings).ThenInclude(b => b.BookingParticipants).FirstOrDefaultAsync(s => s.Id == slotId);
                if (slot == null)
                    throw new Exception("Slot not found");

                if (slot.SlotPlayed)
                {
                    throw new Exception("Slot already completed");
                }
                if (DateTime.UtcNow < slot.StartTime)
                {
                    throw new Exception("Slot has not started yet");
                }

                var activeBooking = slot.Bookings.FirstOrDefault(b => b.Status == "Booked");

                if (activeBooking == null)
                {
                    throw new Exception("No active booking found");
                }

                activeBooking.Status = "Completed";
                activeBooking.UpdatedAt = DateTime.UtcNow;
                Console.WriteLine($"{activeBooking.BId}");

                var participantIds = await _context.BookingParticipants.Where(p => p.BookingId == activeBooking.BId).Select(p => p.EmpId).ToListAsync();
                //var participantIds = activeBooking.BookingParticipants.Where(p => p.BookingId == activeBooking.BId).Select(p => p.EmpId).ToList();
                //var participantIds = activeBooking.
                Console.WriteLine($"Found participants: ");
                foreach (var i in participantIds)
                {
                    Console.WriteLine($"{i}");
                }

                if (participantIds.Any())
                {
                    //Console.WriteLine("Updateig game played");
                    await _employeeCycleStatsService.IncrementCompletedPlayCountAsync(participantIds, slot.CycleId);
                }
                Console.WriteLine($"activeBooking.BookingParticipants.Count + {activeBooking.BookingParticipants.Count}");
                slot.Assigned -= participantIds.Count;
                //slot.Assigned -= activeBooking.BookingParticipants.Count;
                if (slot.Assigned < 0)
                {
                    slot.Assigned = 0;
                }

                var remainingMinutes = (slot.EndTime - DateTime.UtcNow).TotalMinutes;
                int minimumPlayableMinutes = 15;

                if (remainingMinutes >= minimumPlayableMinutes)
                {
                    Console.WriteLine("UUUUUUUUUU");
                    await PromoteFromWaitingQueueAsync(slotId, true);
                }
                else
                {
                    var waitingUsers = await _context.WaitingQueue
                        .Where(q => q.SlotId == slotId && q.Status == "Waiting")
                        .ToListAsync();

                    var expiredUserIds = waitingUsers
                        .Select(q => q.PlayerId)
                        .ToList();

                    foreach (var q in waitingUsers)
                        q.Status = "Expired";

                    if (expiredUserIds.Any())
                        await NotifyBookedUsersAsync(expiredUserIds, slot, activeBooking.BookedBy);

                    slot.SlotPlayed = true;
                    slot.IsBookingOpen = false;
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                Console.WriteLine($"Error: {ex.Message}");
                throw;
            }
        }
        private async Task<List<int>> GetZeroPlayUsers(int cycleId)
        {
            //return  await _context.BookingParticipants.Where(bps => bps.Bookings.GameSlots.CycleId == cycleId).Select(bps=>bps.EmpId).ToListAsync();

            return await _context.EmployeeCycleStats.Where(x => x.GameCycleId == cycleId && x.GamePlayed == 0).Select(x => x.UserId).ToListAsync();
        }

        private async Task<List<GameSlots>> GetFutureAvailableSlots(int cycleId)
        {
            var now = DateTime.UtcNow;

            return await _context.GameSlots.Where(s => s.CycleId == cycleId && s.StartTime > now && s.IsBookingOpen && s.Capacity > s.Assigned)
                .OrderBy(s => s.StartTime)
                .ToListAsync();
        }
        private async Task<List<int>> GetAlreadyBookedUsersInCycle(List<int> candidateUsers, List<GameSlots> slots, int cycleId)
        {
            var slotIds = slots.Select(s => s.Id).ToList();

            var bookingIds = await _context.Bookings.Where(b => b.Status == "Booked" && slotIds.Contains(b.SlotId)).Select(b => b.BId).ToListAsync();

            return await _context.BookingParticipants.Where(bp => bookingIds.Contains(bp.BookingId) && candidateUsers.Contains(bp.EmpId)).Select(bp => bp.EmpId)
                .Distinct()
                .ToListAsync();
        }
        private async Task MoveUsersToWaitingQueue(List<int> users, GameSlots targetSlot, int cycleId)
        {
            foreach (var userId in users)
            {
                bool exists = await _context.WaitingQueue.AnyAsync(q => q.PlayerId == userId && q.SlotId == targetSlot.Id && q.Status == "Waiting");

                if (!exists)
                {
                    await _context.WaitingQueue.AddAsync(
                      new WaitingQueue
                      {
                          PlayerId = userId,
                          SlotId = targetSlot.Id,
                          CycleId = cycleId,
                          Status = "Waiting",
                          InsertionTime = DateTime.UtcNow
                      });
                }
            }
            //also remove fro Booking table as curently directly going in booking
        }

        public async Task AutoAssignSystemSlots(List<int> zeroPlayUsers, List<GameSlots> availableSlots, int cycleId)
        {
            bool hasParentTransaction = _context.Database.CurrentTransaction != null;
            var transaction = hasParentTransaction ? null : await _context.Database.BeginTransactionAsync();

            //using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var alreadyBookedUsers = await GetAlreadyBookedUsersInCycle(zeroPlayUsers, availableSlots, cycleId);

                var earliestSlot = availableSlots.First();

                await MoveUsersToWaitingQueue(alreadyBookedUsers, earliestSlot, cycleId);

                var usersWithPendingInvites = await _context.BookingInvite.Where(i => i.CycleId == cycleId && i.Status == "Pending").Select(i => i.UserId).ToListAsync();

                var eligibleUsers = zeroPlayUsers.Except(alreadyBookedUsers).Except(usersWithPendingInvites).ToList();


                //var eligibleUsers = zeroPlayUsers.Except(alreadyBookedUsers).ToList();

                //var validUsers = new List<int>();
                var validUsersForInvite = new List<int>();
                var targetSlot = availableSlots.First();


                foreach (var userId in eligibleUsers)
                {
                    var (rejected, _) = await _fairnessService.IsHardRejectedAsync(userId, targetSlot.Id);
                    if (!rejected)
                    {
                        validUsersForInvite.Add(userId);
                    }
                }

                if (!validUsersForInvite.Any())
                {
                    if (transaction != null) await transaction.CommitAsync();
                    return;
                }
                int totalAvailableSeats = availableSlots.Sum(s => s.Capacity - s.Assigned);
                var usersToInvite = validUsersForInvite.Take(totalAvailableSeats).ToList();

                var newInvites = new List<BookingInvite>();

                int slotIndex = 0;
                int seatsFilledInCurrentSlot = 0;


                foreach (var userId in usersToInvite)
                {
                    while (slotIndex < availableSlots.Count && (availableSlots[slotIndex].Capacity - availableSlots[slotIndex].Assigned - seatsFilledInCurrentSlot) <= 0)
                    {
                        slotIndex++;
                        seatsFilledInCurrentSlot = 0;
                    }

                    if (slotIndex >= availableSlots.Count)
                    {
                        break;
                    }
                    var selectedSlot = availableSlots[slotIndex];
                    newInvites.Add(
                        new BookingInvite
                        {
                            UserId = userId,
                            SlotId = selectedSlot.Id,
                            CycleId = cycleId,
                            Status = "Pending",
                            InviteToken = Guid.NewGuid().ToString(),
                            CreatedAt = DateTime.UtcNow,
                            ExpiresAt = DateTime.UtcNow.AddHours(2), //2 hours to respond
                            InviteReason = "System Auto-Selection (Zero Play Priority)"
                        }
                    );
                    seatsFilledInCurrentSlot++;
                }
                if (newInvites.Any())
                {
                    await _context.BookingInvite.AddRangeAsync(newInvites);
                    await _context.SaveChangesAsync();
                    foreach (var invite in newInvites)
                    {
                        await SendInviteNotificationEmail(invite, targetSlot);
                    }
                }
                if (transaction != null)
                {
                    await transaction.CommitAsync();
                }
            }
            catch
            {
                if (transaction != null)
                {
                    await transaction.RollbackAsync();
                }
                throw;
            }


        }

        public async Task<string> ProcessInviteResponseAsync(string token, bool isAccepted)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var invite = await _context.BookingInvite.Include(i => i.Slot).FirstOrDefaultAsync(i => i.InviteToken == token && i.Status == "Pending");

                if (invite == null)
                {
                    return "Link invalid or expired.";
                }
                if (invite.Status != "Pending")
                {
                    return "Invite already processed";
                }

                if (isAccepted)
                {
                    if (invite.Slot.Assigned >= invite.Slot.Capacity)
                    {
                        invite.Status = "Expired";
                        await _context.SaveChangesAsync();
                        await transaction.CommitAsync();
                        return "Slot are already Full";
                    }
                    var (rejected, message) = await _fairnessService.IsHardRejectedAsync(invite.UserId, invite.SlotId);

                    if (rejected)
                    {
                        invite.Status = "Rejcted";
                        await _context.SaveChangesAsync();
                        await transaction.CommitAsync();
                        return message;
                    }
                    var booking = new Bookings
                    {
                        SlotId = invite.SlotId,
                        BookedBy = invite.UserId,
                        Status = "Booked",
                        BookedAt = DateTime.UtcNow
                    };
                    await _context.Bookings.AddAsync(booking);
                    await _context.SaveChangesAsync();
                    await _context.BookingParticipants.AddAsync(
                    new BookingParticipants
                    {
                        BookingId = booking.BId,
                        EmpId = invite.UserId
                    });
                    invite.Slot.Assigned += 1;
                    invite.Status = "Accepted";
                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();
                    await NotifyBookedUsersAsync(new List<int> { invite.UserId }, invite.Slot, invite.UserId);

                    return "Slot confirmed!";
                }
                else
                {
                    invite.Status = "Rejected";
                    var stats = await _context.EmployeeCycleStats.FirstOrDefaultAsync(s => s.UserId == invite.UserId && s.GameCycleId == invite.CycleId);

                    if (stats != null)
                    {
                        stats.GamePlayed += 1;
                    }

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();
                    return "Invitation rejected and slot released.";
                }
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
        public async Task CleanupExpiredInvites(int activeCycleId)
        {
            var expiredInvites = await _context.BookingInvite.Where(i => i.CycleId == activeCycleId && i.Status == "Pending" && i.ExpiresAt < DateTime.UtcNow).ToListAsync();
            if (expiredInvites.Any())
            {
                foreach (var invite in expiredInvites)
                {
                    invite.Status = "Expired";
                }
                await _context.SaveChangesAsync();
                Console.WriteLine($"[Cleanup] {DateTime.UtcNow:O}: Released {expiredInvites.Count} expired invite seats.");
            }
        }
        private async Task SendInviteNotificationEmail(BookingInvite invite, GameSlots slot)
        {
            var user = await _context.Users.FindAsync(invite.UserId);
            if (user == null || string.IsNullOrEmpty(user.Email)) return;

            var acceptUrl = $"https://localhost:5235/api/Booking/respond?token={invite.InviteToken}&accept=true";
            var rejectUrl = $"https://localhost:5235/api/Booking/respond?token={invite.InviteToken}&accept=false";

            var body = $@"
                <div>
                    <p>Hello, We've reserved a slot for you!</p>
                    <p>
                        <strong>Date:</strong> {slot.StartTime:dddd, dd MMMM}<br/>
                        <strong>Time:</strong> {slot.StartTime:hh:mm tt}
                    </p>
                    <p >
                        <a href='{acceptUrl}' >
                            ACCEPT INVITATION
                        </a>
                        &nbsp;&nbsp;
                        <a href='{rejectUrl}' >
                            REJECT
                        </a>
                    </p>
                    <p>
                        <i>If the buttons don't work, copy and paste this link into your browser: {acceptUrl}</i>
                    </p>
                </div>";

            await _emailService.SendEmailAsync(user.Email, "Action Required: Game Invitation", body);
        }
        public async Task EvaluateAndTriggerAutoAssign(int cycleId)
        {
            var zeroPlayUsers = await GetZeroPlayUsers(cycleId);
            if (!zeroPlayUsers.Any())
            {
                return;
            }
            var availableSlots = await GetFutureAvailableSlots(cycleId);
            if (!availableSlots.Any())
            {
                return;
            }
            int totalSeats = availableSlots.Sum(s => s.Capacity - s.Assigned);
            int buffer = 1;
            bool isScarcityTriggered = zeroPlayUsers.Count > (totalSeats - buffer);

            var twentyFourHoursAgo = DateTime.UtcNow.AddDays(-1);

            bool recentlyBooked = await _context.Bookings.AnyAsync(b => b.GameSlots.CycleId == cycleId && b.BookedAt >= twentyFourHoursAgo);

            bool LackofActivity = !recentlyBooked;

            if (LackofActivity || isScarcityTriggered)
            {
                string reason = isScarcityTriggered ? "Scarcity" : "LackofActivity";
                Console.WriteLine($"Triggering Auto-Assign for Cycle {cycleId} due to {reason}");
                await AutoAssignSystemSlots(zeroPlayUsers, availableSlots, cycleId);
            }
        }

    }
}