using HRMS_Backend.Entities.JobListing;
using HRMS_Backend.Entities.TravelandExpense;
using HRMS_Backend.Model.JobListing;
using HRMS_Backend.Model.TravelandExpense;

namespace HRMS_Backend.Services.TravelandExpenses
{
    public interface IExpenseProofService
    {
        Task<ExpenseProof> createExpenseProofAsync(ExpenseProofCreateUpdateDto dto);
        Task<ExpenseProofDisplayDto> getExpenseProofById(int id);

        Task<IEnumerable<ExpenseProofDisplayDto>> getExpenseProofByExpenseId(int id);
    }
}
