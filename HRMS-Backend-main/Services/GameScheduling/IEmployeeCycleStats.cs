using HRMS_Backend.Entities.GamesScheduling;
using HRMS_Backend.Model.GameScheduling;

namespace HRMS_Backend.Services.GameScheduling
{
    public interface IEmployeeCycleStatsService
    {
        //Task<EmployeeCycleStatsDisplayDto> GetUserCycleStatsAsync(int userId, int cycleId);
        Task<Boolean> IncrementCompletedPlayCountAsync(List<int> userIds, int CycleId);

        Task<EmployeeCycleStats?> GetUserCycleStatsAsync(int userId, int gameCycleId);

        Task IncreaseGamePlayedAsync(int userId, int gameCycleId);

        Task DecreaseGamePlayedAsync(int userId, int gameCycleId);

        Task ResetCycleStatsAsync(int gameCycleId);
    }
}
