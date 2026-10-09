using HRMS_Backend.Entities.TravelandExpense;
using HRMS_Backend.Model.TravelandExpense;

public interface ITravelExpenseService
{
    Task<TravelExpense> CreateTravelExpenseAsync(ExpenseCreateUpdateDto dto);
    Task<IEnumerable<ExpenseDisplayDto>> GetAllExpenseAsync();
    Task<ExpenseDisplayDto?> GetExpenseByIdAsync(int id);
    //Task<ExpenseDisplayDto?> GetExpenseByTravelAssignmentId(int id);
    Task<int> GetIdfromEmpIDandPID(int EmpId, int PId);
    Task<List<ExpenseDisplayDto>> getExpensesByTravelAssignedId(int id);

    Task<bool> UpdateExpenseByIdAsync(ExpenseCreateUpdateDto dto, int id);
}
