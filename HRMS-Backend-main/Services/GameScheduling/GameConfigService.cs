using AutoMapper;
using HRMS_Backend.Data;
using HRMS_Backend.Entities.Games_Scheduling;
//using HRMS_Backend.Migrations;
using HRMS_Backend.Model.GameScheduling;
using HRMS_Backend.Model.JobListing;
using HRMS_Backend.Model.TravelandExpense;
using Microsoft.EntityFrameworkCore;
using System.Collections;
using System.Numerics;

namespace HRMS_Backend.Services.GameScheduling
{
    public class GameConfigService : IGameConfigService
    {
        private readonly MyDbContext _context;
        private readonly IMapper _mapper;
        public GameConfigService(MyDbContext context, IMapper mapper) { 
            _context = context;
            _mapper = mapper;
        }

        public async Task<GameConfiguration> AddGameConfigurationAsync(GameConfigCreateUpdateDto dto)
        {
            if (dto == null)
            {
                throw new ArgumentNullException(nameof(dto));
            }
            var gameConfig = new GameConfiguration
            {
                Id = dto.Id,
                GamesId = dto.GamesId,
                StartTime = dto.StartTime,
                OverTime = dto.OverTime,
                Capacity = dto.Capacity,
                SlotDuration = dto.SlotDuration,
            };
              await _context.GameConfiguration.AddAsync(gameConfig);
            await _context.SaveChangesAsync();
            return gameConfig;
        }
        public async Task<IEnumerable<GameConfigDisplayDto>> GetAllConfigAsync()
        {
            var config = await _context.GameConfiguration.ToListAsync();
            return _mapper.Map<IEnumerable<GameConfigDisplayDto>>(config);
        }
        public async Task<bool> UpdateGameConfigurationAsync(int id, GameConfigCreateUpdateDto dto)
        {
            var gameconfig = await _context.GameConfiguration.FindAsync(id);
            if (gameconfig == null)
            {
                return false;
            }
            _mapper.Map(dto, gameconfig);

            try
            {
                _context.GameConfiguration.Update(gameconfig);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (DbUpdateException e)
            {
                Console.WriteLine(e.Message);
                return false;
            }
        }
        public async Task<GameConfigDisplayDto> getGameConfigByIdAsync(int id)
        {
            if (id == null)
            {
                throw new ArgumentNullException(nameof(id));
            }
            var GameConfig = await _context.GameConfiguration.FindAsync(id);
            return _mapper.Map<GameConfigDisplayDto>(GameConfig);
        }
    }
}
