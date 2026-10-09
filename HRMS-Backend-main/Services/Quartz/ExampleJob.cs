using HRMS_Backend.Entities.Games_Scheduling;
using HRMS_Backend.Services.Achievements;
using HRMS_Backend.Services.GameScheduling;
using Quartz;
using System.ComponentModel.DataAnnotations;

namespace HRMS_Backend.Services.Quartz
{
    public class ExampleJob : IJob
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly IGamesService _gamesService;
        private readonly IBookingService _bookingService;
        private readonly IGameCycleService _gameCycleService;
        public ExampleJob(IServiceProvider serviceProvider, IGameCycleService gameCycleService, IGamesService gamesService, IBookingService bookingService)
        {
            _serviceProvider = serviceProvider;
            _gamesService = gamesService;
            _bookingService = bookingService;
            _gameCycleService = gameCycleService;
        }
        public async Task Execute(IJobExecutionContext context)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var postService = scope.ServiceProvider.GetRequiredService<IPostsService>();

                await postService.GenerateSystemPosts();
                await postService.GenerateAnniversaryPosts();
                var games = await _gamesService.GetAllGamesAsync();

                foreach (var game in games)
                {
                    var activeCycleId = await _gameCycleService.GetActiveCycleIdAsync(game.Id);
                    if (activeCycleId != 0)
                    {
                        await _bookingService.CleanupExpiredInvites(activeCycleId.Value);
                        await _bookingService.EvaluateAndTriggerAutoAssign(activeCycleId.Value);
                        Console.WriteLine($"[Quartz Job] {DateTime.Now}: Evaluated Auto-Assign for Game {game.Id}");
                    }
                }

            }
        }
    }
}
