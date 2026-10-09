namespace HRMS_Backend.Model.TravelandExpense
{
    public class BulkTravelAssignmentDto
    {
        public int PId { get; set; }
        public List<int> EmpId { get; set; } = new List<int>();
        public string Status { get; set; } = "Planned";
    }
}
