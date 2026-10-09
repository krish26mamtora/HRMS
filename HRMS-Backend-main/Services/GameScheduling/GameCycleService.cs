using AutoMapper;
using HRMS_Backend.Data;
using HRMS_Backend.Entities.Games_Scheduling;
using HRMS_Backend.Entities.GamesScheduling;
using HRMS_Backend.Model.GameScheduling;
using HRMS_Backend.Model.JobListing;
using Microsoft.EntityFrameworkCore;

namespace HRMS_Backend.Services.GameScheduling
{
    public class GameCycleService : IGameCycleService
    {
        private readonly MyDbContext _context;
        private readonly IMapper _mapper;
        public GameCycleService(MyDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }
        public async Task<IEnumerable<GameCycle>> GetAllGameCyclesAsync()
        {
            return await _context.GameCycle.ToListAsync();
        }


        public async Task<GameCycle> GetGameCycleByIdAsync(int id)
        {
            return await _context.GameCycle.FirstOrDefaultAsync(gc => gc.CycleId == id);
        }
        public async Task<GameCycleDisplayDto> CreateGameCycleAsync(GameCycleCreateUpdateDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {

                var gameCycle = new GameCycle
                {
                    GamesId = dto.GamesId,
                    StartTime = dto.StartTime,
                    EndTime = dto.EndTime,
                    isActive = dto.isActive
                };
                await _context.GameCycle.AddAsync(gameCycle);
                await _context.SaveChangesAsync();
                var gameName = await _context.Games.Where(g => g.Id == dto.GamesId).Select(g => g.Name).FirstOrDefaultAsync();
                if (gameName!=null)
                {
                    var interestedEmployee = await _context.UserProfile.Where(up => up.FavouriteSport == gameName).Select(ep => ep.UserProfileId).ToListAsync();

                    //Console.Write(interestedEmployee);
                    //Console.Write("list is here");

                    if (interestedEmployee.Count > 0)
                    {
                         await InitializeCycleStatsAsyc(gameCycle.CycleId, interestedEmployee);
                    }
                }
                await transaction.CommitAsync();
                         return _mapper.Map<GameCycleDisplayDto>(gameCycle);

            }
            catch
            {
                await transaction.RollbackAsync(); throw;
            }
        }

        public async Task<GameCycleDisplayDto> getCycleById(int id)
        {
            if (id <= 0)
            {
                throw new ArgumentNullException("Game id must br greater than 0");
            }
            var gameCycle = await _context.GameCycle.FindAsync(id);
            var GameCycleDto = _mapper.Map<GameCycleDisplayDto>(gameCycle);
            return GameCycleDto;
        }

        public async Task<int?> GetActiveCycleIdAsync(int gameId)
        {
            if (gameId <= 0)
            {
                throw new ArgumentException("Game Id must be greter then 0", nameof(gameId));
            }
            var activeCycleId = await _context.GameCycle.Where(gc => gc.GamesId == gameId && gc.isActive)
                    .Select(gc => gc.CycleId).FirstOrDefaultAsync();

            return activeCycleId;
        }
        public async Task<int> getLowsetGamePlayedInCurrentCycle(int cycleId)
        {
            var statsExist = await _context.EmployeeCycleStats.AnyAsync(es => es.GameCycleId == cycleId);
            if (!statsExist) {
                return 0;
            }
            var lowestGamePlayedVal = await _context.EmployeeCycleStats
             .Where(es => es.GameCycleId == cycleId)
             .MinAsync(es=>es.GamePlayed);

            return lowestGamePlayedVal;
        }
        public async Task InitializeCycleStatsAsyc(int cycleId, List<int> InteretedUser)
        {
            var stats = InteretedUser.Select(userId => new EmployeeCycleStats
            {
                UserId = userId,
                GameCycleId = cycleId,
                GamePlayed = 0
            }).ToList();

            await _context.EmployeeCycleStats.AddRangeAsync(stats);

            await _context.SaveChangesAsync();
        }


    }
}
