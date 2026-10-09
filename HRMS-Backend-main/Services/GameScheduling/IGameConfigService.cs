using HRMS_Backend.Entities.Games_Scheduling;
using HRMS_Backend.Model.GameScheduling;
using System.Collections;

namespace HRMS_Backend.Services.GameScheduling
{
    public interface IGameConfigService
    {

        Task<GameConfiguration> AddGameConfigurationAsync(GameConfigCreateUpdateDto dto);
        Task<GameConfigDisplayDto> getGameConfigByIdAsync(int id);
        Task<bool> UpdateGameConfigurationAsync(int id, GameConfigCreateUpdateDto dto);
        Task<IEnumerable<GameConfigDisplayDto>> GetAllConfigAsync();
    }
}
