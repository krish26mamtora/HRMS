using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace HRMS_Backend.Controllers.TravelandExpense
{
    [Authorize]
    public class NotificationHub : Hub
    {
        // Methods here can be called by clients (e.g., SendNotification)
        public async Task SendNotificationToUser(string userId, string message)
        {
            await Clients.User(userId).SendAsync("ReceiveNotification", message);
        }
    }
}
