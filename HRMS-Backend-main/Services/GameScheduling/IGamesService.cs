using HRMS_Backend.Entities.Games_Scheduling;
using HRMS_Backend.Model.GameScheduling;

namespace HRMS_Backend.Services.GameScheduling
{
    public interface IGamesService
    {
        Task<IEnumerable<GamesDisplayDto>> GetAllGamesAsync();
        //Task<Games?> GetGameByIdAsync(int id);
        Task<Games> CreateGameAsync(GameCreateUpdateDto dto);
        //Task<bool> UpdateGameAsync(int id, Games updatedGame);
        //Task<bool> DeleteGameAsync(int id);
    }
}
