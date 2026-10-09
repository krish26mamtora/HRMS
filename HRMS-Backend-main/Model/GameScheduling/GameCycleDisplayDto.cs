namespace HRMS_Backend.Model.GameScheduling
{
    public class GameCycleDisplayDto
    {
        public int CycleId { get; set; }
        public int GamesId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public Boolean isActive { get; set; }
    }
}
