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
            var expenseDate = AsUtc(dto.ExpenseDate);
            var expenseDateOnly = DateOnly.FromDateTime(expenseDate);
            await EnsureDailyExpenseLimitAsync(dto.TravelAssignId, dto.ExpenseType.Value, expenseDateOnly, dto.Amount);

            var now = DateTime.UtcNow;
            var travelPlanExpense = new TravelExpense
            {
                TravelAssignId = dto.TravelAssignId,
                ExpenseType = dto.ExpenseType,
                Amount = dto.Amount,
                Status = dto.Status,
                ExpenseDate = expenseDate,
                Description = dto.Description,
                ApprovedBy = dto.ApprovedBy,
                CreatedAt = now,
                UpdatedAt = now
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
            var createdAt = expense.CreatedAt;
            _mapper.Map(dto, expense);
            expense.ExpenseDate = AsUtc(dto.ExpenseDate);
            expense.CreatedAt = createdAt;
            expense.UpdatedAt = DateTime.UtcNow;
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
        private async Task EnsureDailyExpenseLimitAsync(int travelAssignId, int expenseType, DateOnly date, decimal newAmount)
        {
            var policy = await _context.ExpensePolicy
                .Where(ep => ep.Id == expenseType)
                .Select(ep => new { ep.Category, ep.MaxAmout })
                .SingleOrDefaultAsync();
            if (policy == null || policy.MaxAmout <= 0)
            {
                throw new InvalidOperationException(
                    $"No valid expense limit is configured for category {expenseType}.");
            }

            var startOfDayUtc = DateTime.SpecifyKind(
                date.ToDateTime(TimeOnly.MinValue),
                DateTimeKind.Utc);
            var startOfNextDayUtc = startOfDayUtc.AddDays(1);

            var dailyTotal = await _context.TravelExpense
                .Where(te =>
                    te.TravelAssignId == travelAssignId &&
                    te.ExpenseDate >= startOfDayUtc &&
                    te.ExpenseDate < startOfNextDayUtc &&
                    te.ExpenseType == expenseType)
                .SumAsync(te => te.Amount);

            if (dailyTotal + newAmount > policy.MaxAmout)
            {
                throw new InvalidOperationException(
                    $"Daily limit for {policy.Category} is {policy.MaxAmout}. " +
                    $"Already claimed: {dailyTotal}; this expense: {newAmount}.");
            }
        }

        private static DateTime AsUtc(DateTime value) =>
            value.Kind switch
            {
                DateTimeKind.Utc => value,
                DateTimeKind.Local => value.ToUniversalTime(),
                _ => DateTime.SpecifyKind(value, DateTimeKind.Utc)
            };
    }
}
