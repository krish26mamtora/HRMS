using HRMS_Backend.Entities.TravelandExpense;
using HRMS_Backend.Model.JobListing;
using HRMS_Backend.Model.TravelandExpense;
using Microsoft.AspNetCore.Mvc;

namespace HRMS_Backend.Services.TravelandExpenses
{
    public interface ITravelPlanService
    {
        Task<TravelPlan> CreateTravelPlanAsync(TravelCreateUpdateDto dto);
        Task<IEnumerable<TravelResponseDto>> GetAllPlansAsync();

        Task<TravelResponseDto?> GetPlanByIdAsync(int id);

        Task<bool> UpdatePlanById(int id, TravelCreateUpdateDto dto);
        Task<bool> DeletePlanById(int id);

       Task<DateTime?> GetToDate(int id);
    }
}
