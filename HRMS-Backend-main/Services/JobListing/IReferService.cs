using HRMS_Backend.Entities.JobListing;
using HRMS_Backend.Model.JobListing;

namespace HRMS_Backend.Services.JobListing
{
    public interface IReferService
    {
        Task<JobRefferalResponseDto> getReferalById(int id);
        Task<List<JobRefferalResponseDto>> getReferalByJobId(int id);
        Task<JobRefferalResponseDto> getReferalByUserId(int id);
        Task<Referals> createReferalAsync(JobRefferalCreateUpdateDto dto);
        Task<bool> UpdateReferalWithId(int id, JobRefferalCreateUpdateDto dto);
    }
}


