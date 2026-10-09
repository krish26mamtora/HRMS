namespace HRMS_Backend.Entities.TravelandExpense
{
    public class InAppNotification
    {
        public int Id { get; set; }
        public int EmpId { get; set; }
        public string Message { get; set; }
        public bool IsRead { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
