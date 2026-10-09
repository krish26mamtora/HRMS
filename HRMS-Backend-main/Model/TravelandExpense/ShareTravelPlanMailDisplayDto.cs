namespace HRMS_Backend.Model.TravelandExpense
{
    public class ShareTravelPlanMailDisplayDto
    {
        public int PId { get; set; }
        public string ReceiverMail { get; set; } = string.Empty;
        public int EmpId { get; set; }

        public string Subject { get; set; } = string.Empty;

        public string Message { get; set; } = string.Empty;
    }
}
