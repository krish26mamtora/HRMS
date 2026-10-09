namespace HRMS_Backend.Model.GameScheduling
{
    public class WaitingQueueDisplayDto
    {
        public int QueueId { get; set; }
        public int UserId { get; set; }
        public int BookingId { get; set; }
        public int SlotId { get; set; }
        public int CycleId { get; set; }
        public string Status { get; set; }
        public DateTime InsertionTime { get; set; }
        public DateTime UpdationTime { get; set; }

    }
}
