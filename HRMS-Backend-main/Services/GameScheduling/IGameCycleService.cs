using HRMS_Backend.Entities.GamesScheduling;
using HRMS_Backend.Model.GameScheduling;

namespace HRMS_Backend.Services.GameScheduling
{
    public interface IGameCycleService
    {
        Task<IEnumerable<GameCycle>> GetAllGameCyclesAsync();
        Task<GameCycle> GetGameCycleByIdAsync(int id);
        Task<GameCycleDisplayDto> CreateGameCycleAsync(GameCycleCreateUpdateDto dto);
        Task<int?> GetActiveCycleIdAsync(int gameId);
        Task<int> getLowsetGamePlayedInCurrentCycle(int cycleId);
        Task InitializeCycleStatsAsyc(int cycleId, List<int> InteretedUser); 

        Task<GameCycleDisplayDto> getCycleById(int id);
    }
}
