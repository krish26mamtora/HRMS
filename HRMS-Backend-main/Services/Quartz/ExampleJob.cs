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
        private readonly ILogger<ExampleJob> _logger;

        public ExampleJob(IServiceProvider serviceProvider, IGameCycleService gameCycleService, IGamesService gamesService, IBookingService bookingService, ILogger<ExampleJob> logger)
        {
            _serviceProvider = serviceProvider;
            _gamesService = gamesService;
            _bookingService = bookingService;
            _gameCycleService = gameCycleService;
            _logger = logger;
        }
        public async Task Execute(IJobExecutionContext context)
        {
            _logger.LogInformation("Quartz job started at {Time}.", DateTimeOffset.UtcNow);
            using (var scope = _serviceProvider.CreateScope())
            {
                var postService = scope.ServiceProvider.GetRequiredService<IPostsService>();

                var birthdayPostsCreated = await postService.GenerateSystemPosts();
                _logger.LogInformation(
                    "Quartz job generated {BirthdayPostCount} birthday posts.",
                    birthdayPostsCreated);
                await postService.GenerateAnniversaryPosts();
                var games = await _gamesService.GetAllGamesAsync();

                foreach (var game in games)
                {
                    var activeCycleId = await _gameCycleService.GetActiveCycleIdAsync(game.Id);
                    if (activeCycleId != 0)
                    {
                        await _bookingService.CleanupExpiredInvites(activeCycleId.Value);
                        await _bookingService.EvaluateAndTriggerAutoAssign(activeCycleId.Value);
                        Console.WriteLine($"[Quartz Job] {DateTimeOffset.UtcNow:O}: Evaluated Auto-Assign for Game {game.Id}");
                    }
                }

                _logger.LogInformation("Quartz job completed at {Time}.", DateTimeOffset.UtcNow);
            }
        }
    }
}
