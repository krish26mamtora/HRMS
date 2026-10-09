using HRMS_Backend.Entities.GamesScheduling;
using HRMS_Backend.Model.GameScheduling;

namespace HRMS_Backend.Services.GameScheduling
{
    public interface IWaitingQueueService
    {
        public Task<WaitingQueue> AddUsersToQueueAsync(int bookingId, int slotId, int cycleId, int userIds);
        public Task<IEnumerable<WaitingQueueDisplayDto>> GetWaitingUsersAsync(int slotId);
        public Task<Boolean> MarkUserAsAssignedAsync(int slotId, int userId);
        public Task<Boolean> RemoveUserFromQueueAsync(int slotId, int userId);

        public Task<Boolean> IsUserInQueueAsync(int slotId, int userId);
        public Task<IEnumerable<WaitingQueueDisplayDto>> GetWaitingQueueByPlayerId(int playerId);
    }
}
