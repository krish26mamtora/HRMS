namespace HRMS_Backend.Model.GameScheduling
{
    public class InviteStatusDto
    {
        public int InviteId { get; set; }
        public string UserName { get; set; }
        public string SlotRange { get; set; }
        public string Status { get; set; }
        public DateTime ExpiresAt { get; set; }
    }
}
