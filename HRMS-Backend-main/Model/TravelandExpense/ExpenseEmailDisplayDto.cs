namespace HRMS_Backend.Model.TravelandExpense
{
    public class ExpenseEmailDisplayDto
    {
        public int Id { get; set; }
        public int TravelExpenseId { get; set; }
        public string RecipientEmail { get; set; }
        public int SenderId { get; set; }
        public string Subject { get; set; }
        public string Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? SentAt { get; set; }
    }
}
