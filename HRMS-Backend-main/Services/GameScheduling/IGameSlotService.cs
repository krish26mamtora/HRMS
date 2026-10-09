using HRMS_Backend.Model.GameScheduling;
using Microsoft.AspNetCore.Mvc;

namespace HRMS_Backend.Services.GameScheduling
{
    public interface IGameSlotService
    {
        public Task<int?> GenerateGameSlotAsync(int GamesId, DateOnly gameDate);
        public Task<IEnumerable<GameSlotsDisplayDto>> GetAllGamesSlotAsync();
        public  Task<IEnumerable<GameSlotsDisplayDto>> GetGamesSlotForGameAndDateAsync(int id, DateTime dt);

        public Task<Boolean> CompleteSlotAsync(int slotId);
    }

}
