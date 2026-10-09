using AutoMapper;
using HRMS_Backend.Data;
using HRMS_Backend.Entities.GamesScheduling;
using HRMS_Backend.Model.GameScheduling;
using Microsoft.EntityFrameworkCore;

namespace HRMS_Backend.Services.GameScheduling
{
    public class EmployeeCycleStatsService : IEmployeeCycleStatsService
    {
        private readonly MyDbContext _context;
        private readonly IMapper _mapper;
        private readonly IGameCycleService _gameCycleService;
        public EmployeeCycleStatsService(MyDbContext context, IMapper mapper , IGameCycleService gameCycleService)
        {
            _context = context;
            _mapper = mapper;
            _gameCycleService = gameCycleService;
        }
        public async Task<EmployeeCycleStats> createEmployeeCycleStats(EmployeeCycleStatsCreateUpdateDto dto)
        {
            var employeeCycleStats = new EmployeeCycleStats
            {
                GameCycleId = dto.GameCycleId,
                GamePlayed = dto.GamePlayed
            };
            _context.EmployeeCycleStats.Add(employeeCycleStats);
            await _context.SaveChangesAsync();
            return employeeCycleStats;
        }

  
        public async Task<EmployeeCycleStats?> GetUserCycleStatsAsync(int userId, int cycleId)
        {
            var cyclestatus = await _context.EmployeeCycleStats
                .FirstOrDefaultAsync(es => es.UserId == userId && es.GameCycleId == cycleId);
            return cyclestatus;
        }

        public async Task<Boolean> IncrementCompletedPlayCountAsync(List<int> userIds, int CycleId)
        {
            var stats = await _context.EmployeeCycleStats.Where(es => es.GameCycleId == CycleId && userIds.Contains(es.UserId)).ToListAsync();
            foreach (var stat in stats)
            {
                Console.WriteLine($"Redirect - +{stat.SId}");
                stat.GamePlayed++;
            }
            //await _context.SaveChangesAsync();
            return true;
        }
        public async Task DecreaseGamePlayedAsync(int userId, int gameCycleId)
        {
          
            var stat = await _context.EmployeeCycleStats.FirstOrDefaultAsync(x => x.UserId == userId && x.GameCycleId == gameCycleId);

            if (stat == null) return;
            if (stat.GamePlayed > 0) stat.GamePlayed -= 1;
            await _context.SaveChangesAsync();
        }
        public async Task ResetCycleStatsAsync(int gameCycleId)
        {
            var statsList = await _context.EmployeeCycleStats
                .Where(x => x.GameCycleId == gameCycleId)
                .ToListAsync();
            foreach (var stats in statsList)
            {
                stats.GamePlayed = 0;
            }
            await _context.SaveChangesAsync();
        }
        public async Task IncreaseGamePlayedAsync(int userId, int gameCycleId)
        {
            var stats = await _context.EmployeeCycleStats.FirstOrDefaultAsync(x => x.UserId == userId && x.GameCycleId == gameCycleId);

            if (stats == null)
            {
                stats = new EmployeeCycleStats
                {
                    UserId = userId,
                    GameCycleId = gameCycleId,
                    GamePlayed = 1
                };
                await _context.EmployeeCycleStats.AddAsync(stats);
            }
            else
            {
                stats.GamePlayed += 1;
            }
            await _context.SaveChangesAsync();
        }

    }
}
