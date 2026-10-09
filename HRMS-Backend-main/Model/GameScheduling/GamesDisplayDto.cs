namespace HRMS_Backend.Model.GameScheduling
{
    public class GamesDisplayDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty; 
        public string Location { get; set; } = string.Empty;
        public bool IsAvailable { get; set; }

    }
}
