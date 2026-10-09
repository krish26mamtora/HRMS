namespace HRMS_Backend.Services.GameScheduling
{
    public interface IFairnessService
    {
       
        Task<(bool IsRejected, string Message)> IsHardRejectedAsync(int userId, int slotId);

        Task<bool> IsEligibleForDirectBookingAsync(int userId, int cycleId);

     
        Task<int> GetUserPriorityAsync(int userId, int cycleId);
    }
}

