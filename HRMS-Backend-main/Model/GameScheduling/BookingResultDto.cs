namespace HRMS_Backend.Model.GameScheduling
{
    public class BookingResultDto
    {
        public List<UserBookingDetail> UserResults { get; set; } = new List<UserBookingDetail>();

        public List<int> BookedUsers { get; set; } = new List<int>();
        public List<int> WaitingUsers { get; set; } = new List<int>();
    }
    public class UserBookingDetail
    {
        public int UserId { get; set; }
        public string Status { get; set; } 
        public string Message { get; set; }
    }
}
