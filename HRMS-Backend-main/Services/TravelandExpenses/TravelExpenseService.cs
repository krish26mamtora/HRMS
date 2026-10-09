using AutoMapper;
using HRMS_Backend.Data;
using HRMS_Backend.Entities.JobListing;
using HRMS_Backend.Entities.TravelandExpense;
using HRMS_Backend.Model.JobListing;
using HRMS_Backend.Model.TravelandExpense;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace HRMS_Backend.Services.TravelandExpenses
{
    public class TravelExpenseService : ITravelExpenseService
    {
        private readonly MyDbContext _context;
        private readonly IMapper _mapper;
        public TravelExpenseService(MyDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<TravelExpense> CreateTravelExpenseAsync(ExpenseCreateUpdateDto dto)
        {

            DateOnly DateOnly = DateOnly.FromDateTime(dto.ExpenseDate);
            var checkDailyLimit = await getExpenseListForEmployeeByDate(dto.TravelAssignId, dto.ExpenseType.Value, DateOnly, dto.Amount);
            if (!checkDailyLimit)
            {
                throw new InvalidOperationException("Daily expense limit exceeded for this category.");
            }
            var travelPlanExpense = new TravelExpense
            {
                TravelAssignId = dto.TravelAssignId,
                ExpenseType = dto.ExpenseType,
                Amount = dto.Amount,
                Status = dto.Status,
                ExpenseDate = dto.ExpenseDate,
                Description = dto.Description,
                ApprovedBy = dto.ApprovedBy,
                CreatedAt = dto.CreatedAt,
                UpdatedAt = dto.UpdatedAt
            };

            _context.TravelExpense.Add(travelPlanExpense);
            await _context.SaveChangesAsync();
            return travelPlanExpense;

        }

        public async Task<IEnumerable<ExpenseDisplayDto>> GetAllExpenseAsync()
        {
            var expenses = await _context.TravelExpense.ToListAsync();
            return _mapper.Map<IEnumerable<ExpenseDisplayDto>>(expenses); // need ot add 
        }

        public async Task<ExpenseDisplayDto> GetExpenseByIdAsync(int id)
        {
            var expense = await _context.TravelExpense.FindAsync(id);
            if (expense == null)
            {
                return null;
            }
            return _mapper.Map<ExpenseDisplayDto>(expense);
        }

        public async Task<bool> UpdateExpenseByIdAsync(ExpenseCreateUpdateDto dto, int id)
        {
            var expense = await _context.TravelExpense.FindAsync(id);
            if (expense == null)
            {
                return false;
            }
            _mapper.Map(dto, expense);
            try
            {
                _context.TravelExpense.Update(expense);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (DbUpdateException ex)
            {
                Console.Write(ex.Message);
                return false;
            }
        }

        public async Task<int> GetIdfromEmpIDandPID(int EmpId, int PId)
        {
            var row = await _context.TravelAssignment
                    .FirstOrDefaultAsync(x => x.EmpId == EmpId && x.PId == PId);
            return row?.Id ?? 0;
        }
        public async Task<List<ExpenseDisplayDto>> getExpensesByTravelAssignedId(int id)
        {
            var expense = await _context.TravelExpense.Where(ex => ex.TravelAssignId == id).ToListAsync();
            if (expense == null)
            {
                return null;
            }
            return _mapper.Map<List<ExpenseDisplayDto>>(expense);
        }
        public async Task<bool> getExpenseListForEmployeeByDate(int travelAssignId, int expenseType, DateOnly date, decimal newAmount)
        {
            DateTime filterDate = date.ToDateTime(TimeOnly.MinValue);

            var ans = await _context.TravelExpense.Where(te => te.TravelAssignId == travelAssignId && te.ExpenseDate.Date == filterDate.Date && te.ExpenseType == expenseType).SumAsync(te => te.Amount);

            var cmp = await _context.ExpensePolicy.Where(ep => ep.Id == expenseType).Select(ep => ep.MaxAmout).FirstOrDefaultAsync();

            return (ans + newAmount) <= cmp;
        }
    }
}
