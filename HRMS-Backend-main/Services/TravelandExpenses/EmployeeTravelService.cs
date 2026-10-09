using AutoMapper;
using HRMS_Backend.Data;
using HRMS_Backend.Entities.TravelandExpense;
using HRMS_Backend.Model.JobListing;
using HRMS_Backend.Model.TravelandExpense;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics.Eventing.Reader;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace HRMS_Backend.Services.TravelandExpenses
{

    public class EmployeeTravelService : IEmployeeTravelService
    {
        private readonly MyDbContext _context;
        private readonly IMapper _mapper;
        public EmployeeTravelService(MyDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }
        public async Task<IEnumerable<TravelAssignmentDisplayDto>> getAllAssignDetails()
        {
            var Jobs = await _context.TravelAssignment.ToListAsync();
            return _mapper.Map<IEnumerable<TravelAssignmentDisplayDto>>(Jobs);
        }
        public async Task<TravelAssignmentDisplayDto?> getAssignedTravelPlayById(int id)
        {
            var assignedPlan = await _context.TravelAssignment.FindAsync(id);
            var assignedPlanDto = _mapper.Map<TravelAssignmentDisplayDto>(assignedPlan);
            return assignedPlanDto;
        }

        public async Task<IEnumerable<TravelAssignmentDisplayDto>> getAllAssignedPlansForEmpId(int id)
        {
            var assignedPlans = await _context.TravelAssignment.Where(ta => ta.EmpId == id).ToListAsync();
            var assignedPlansDto = _mapper.Map<IEnumerable<TravelAssignmentDisplayDto>>(assignedPlans);
            return assignedPlansDto;

        }
        public async Task<bool> createBulkUploadTravelPlan(BulkTravelAssignmentDto dto)
        {
            var now = DateTime.UtcNow;

            var existingEmpIds = await _context.TravelAssignment
            .Where(ta => ta.PId == dto.PId && dto.EmpId.Contains(ta.EmpId))
            .Select(ta => ta.EmpId)
            .ToListAsync();

            var newEmpIds = dto.EmpId.Except(existingEmpIds).ToList();

            if (!newEmpIds.Any())
            {
                throw new Exception("Employees are already assigned to this plan.");
            }
            var assignments = newEmpIds.Select(empId => new TravelAssignment
            {
                EmpId = empId,
                PId = dto.PId,
                Status = dto.Status,
                CreatedAt = now
            }).ToList();
            await _context.TravelAssignment.AddRangeAsync(assignments);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<int>> getAllEmployeesAssignedToPlan(int id)
        {
            try
            {
                return await _context.TravelAssignment
                    .Where(ta => ta.PId == id)
                    .Select(ta => ta.EmpId)              
                    .ToListAsync();
            }
            catch (Exception e)
            {
                Console.WriteLine("Error occured : ", e.Message);
                return new List<int>();
            }

        }
    }
}
