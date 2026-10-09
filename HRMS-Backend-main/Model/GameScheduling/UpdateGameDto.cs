namespace HRMS_Backend.Model.GameScheduling
{
    public class UpdateGameDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public bool IsAvailable { get; set; }
        public TimeOnly StartTime { get; set; }
        public TimeOnly OverTime { get; set; }
        public int SlotDuration { get; set; }
        public int Capacity { get; set; }
    }
}
