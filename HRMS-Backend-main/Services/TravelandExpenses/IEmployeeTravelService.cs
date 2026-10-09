using HRMS_Backend.Model.TravelandExpense;

namespace HRMS_Backend.Services.TravelandExpenses
{
    public interface IEmployeeTravelService
    {
        Task<IEnumerable<TravelAssignmentDisplayDto>> getAllAssignedPlansForEmpId(int id);
      Task<bool> createBulkUploadTravelPlan(BulkTravelAssignmentDto dto);
        Task<IEnumerable<TravelAssignmentDisplayDto>> getAllAssignDetails();
        Task<TravelAssignmentDisplayDto?> getAssignedTravelPlayById(int id);
        Task<List<int>> getAllEmployeesAssignedToPlan(int id);
    }
}