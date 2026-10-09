using AutoMapper;
using HRMS_Backend.Data;
using HRMS_Backend.Entities.Games_Scheduling;
using HRMS_Backend.Entities.JobListing;
using HRMS_Backend.Model.GameScheduling;
using HRMS_Backend.Model.TravelandExpense;
using Microsoft.EntityFrameworkCore;

namespace HRMS_Backend.Services.GameScheduling
{
    public class GamesService : IGamesService
    {
        private readonly MyDbContext _context;
        private readonly IMapper _mapper;
        public GamesService(MyDbContext context, IMapper mapper) {
            _context = context;
            _mapper = mapper;
        }

        public async Task<IEnumerable<GamesDisplayDto>> GetAllGamesAsync()
        {  
            var games = await _context.Games.ToListAsync();
            return _mapper.Map<IEnumerable<GamesDisplayDto>>(games);
        }
        public async Task<Games> CreateGameAsync(GameCreateUpdateDto dto)
        {
            var game = new Games
            {
              Name = dto.Name,
              IsAvailable = dto.IsAvailable,
              Location = dto.Location,  
            };
            await _context.Games.AddAsync(game);
            await _context.SaveChangesAsync();
            return game;
        }
        public async Task<bool> DeleteGameAsync(int id) { 
            var game = await _context.Games.FindAsync(id);
            if(game == null)
            {
                return false;
            }
            _context.Games.Remove(game);
            await _context.SaveChangesAsync();
            return true;
        } 
    }
}
