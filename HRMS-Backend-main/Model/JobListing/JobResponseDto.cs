namespace HRMS_Backend.Model.JobListing
{
    public class JobResponseDto
    {
        public  int Id {  get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description {  get; set; } = string.Empty ;
        public string Status { get; set; } = string.Empty;
        public int ExpYearsReq { get; set; }
        public int ManagedBy { get; set; }

        public string ReviewerEmail { get; set; } = string.Empty;
        public string Role { get; set; }  = string.Empty;
       public  int TotalPositions { get; set; } 
        public string JdUrl { get; set; } = string.Empty;
        public string ContactMail { get; set; } = string.Empty;

    }
}
