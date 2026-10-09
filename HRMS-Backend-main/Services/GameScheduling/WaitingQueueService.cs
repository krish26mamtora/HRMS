using AutoMapper;
using HRMS_Backend.Data;
using HRMS_Backend.Entities;
using HRMS_Backend.Entities.Games_Scheduling;
using HRMS_Backend.Entities.GamesScheduling;
using HRMS_Backend.Model.GameScheduling;
using Microsoft.EntityFrameworkCore;
using Org.BouncyCastle.Asn1.Nist;

namespace HRMS_Backend.Services.GameScheduling
{
    public class WaitingQueueService : IWaitingQueueService
    {

        private readonly MyDbContext _context;
        private readonly IMapper _mapper;
        public WaitingQueueService(MyDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<WaitingQueue> AddUsersToQueueAsync(int bookingId ,int slotId,int cycleId, int userIds)
        {
            var waitingQueue = new WaitingQueue
            {
                SlotId = slotId,
                CycleId = cycleId,
                Status = "Waiting"
            };
            await _context.WaitingQueue.AddAsync(waitingQueue);
            await _context.SaveChangesAsync();
            return waitingQueue;
        }

        public async Task<IEnumerable<WaitingQueueDisplayDto>> GetWaitingUsersAsync(int slotId)
        {
            var waitinglist = await _context.WaitingQueue.Where(wl => wl.SlotId == slotId && wl.Status == "Waiting").ToListAsync();
            return _mapper.Map<IEnumerable<WaitingQueueDisplayDto>>(waitinglist);
        }
        public async Task<Boolean> MarkUserAsAssignedAsync(int slotId, int userId)
        {
            var record = await _context.WaitingQueue.FirstOrDefaultAsync(wq => wq.SlotId == slotId && wq.PlayerId == userId && wq.Status == "Waiting");

            if (record == null) return false;

            record.Status = "Assigned";
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<Boolean> RemoveUserFromQueueAsync(int slotId, int userId)
        {
            var record = await _context.WaitingQueue.FirstOrDefaultAsync(wq => wq.SlotId == slotId && wq.PlayerId == userId);

            if (record == null) return false;

            _context.WaitingQueue.Remove(record);
             await _context.SaveChangesAsync();
             return true;
        }

        public async Task<Boolean> IsUserInQueueAsync(int slotId, int userId)
        {
            return await _context.WaitingQueue.AnyAsync(wq => wq.SlotId == slotId && wq.PlayerId == userId && wq.Status == "Waiting");
        }
        public async Task<IEnumerable<WaitingQueueDisplayDto>> GetWaitingQueueByPlayerId(int playerId)
        {
            if (playerId <= 0)
                throw new ArgumentException("Invalid Player ID", nameof(playerId));

            var queueItems = await _context.WaitingQueue
                   .Where(wq => wq.PlayerId == playerId)
                   //.Select(wq => wq.SlotId)
                   // .Include()
                   //.Distinct()
                   .ToListAsync();

            //    var queueItems = await _context.WaitingQueue
            //        .Include(wq=>wq.SlotId)
            //.Include(wq => wq.GameCycle)
            //    .ThenInclude(gc => gc.Games) 
            //        .ThenInclude(gm=>gm.Name)
            //.Include(wq => wq.GameSlots)     
            //    .ThenInclude(gs=>gs.StartTime)
            //     .Include(wq => wq.GameSlots)
            //    .ThenInclude(gs => gs.EndTime)
            //.Where(wq => wq.PlayerId == playerId)
            //.ToListAsync();
            return _mapper.Map<IEnumerable<WaitingQueueDisplayDto>>(queueItems);
        }
    }
}
