using AutoMapper;
using HRMS_Backend.Data;
using HRMS_Backend.Entities.TravelandExpense;
using HRMS_Backend.Model.JobListing;
using HRMS_Backend.Model.TravelandExpense;
using Microsoft.EntityFrameworkCore;
using System.Numerics;
using System.Runtime.InteropServices;

namespace HRMS_Backend.Services.TravelandExpenses
{
    public class TravelPlanService : ITravelPlanService
    {
        private readonly MyDbContext _context;
        private readonly IMapper _mapper;
        public TravelPlanService(MyDbContext context , IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<TravelPlan> CreateTravelPlanAsync(TravelCreateUpdateDto  dto)
        {
            var travelPlan = new TravelPlan
            {
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Destination = dto.Destination,
                Purpose = dto.Purpose,
                TravelMode = dto.TravelMode,
                TripType = dto.TripType,
                
                CreatedByUserId = dto.CreatedByUserId
            };
            //var travelPlan = _mapper.Map<TravelPlan>(dto);
            if(travelPlan.StartDate > travelPlan.EndDate)
            {
                throw new Exception("Start date should be less then end date");
            }
            _context.TravelPlan.Add(travelPlan);
            await _context.SaveChangesAsync();
            return travelPlan;

        }

        public async Task<IEnumerable<TravelResponseDto>> GetAllPlansAsync()
        {
            var plans = await _context.TravelPlan.ToListAsync();
            return _mapper.Map<IEnumerable<TravelResponseDto>>(plans);
        }
        public async Task<TravelResponseDto> GetPlanByIdAsync(int id)
        {
            var plan = await _context.TravelPlan.FindAsync(id);
            if(plan == null)
            {
                return null;
            }
           return  _mapper.Map<TravelResponseDto>(plan);
         }

        public async Task<bool> UpdatePlanById(int id , TravelCreateUpdateDto dto)
        {
            var plan = await _context.TravelPlan.FindAsync(id);
            if(plan == null)
            {
                return false;
            }
            _mapper.Map(dto, plan);
            try
            {
                _context.TravelPlan.Update(plan);
                await _context.SaveChangesAsync();
                return true;
            }
            catch(DbUpdateException ex)
            {
                Console.Write(ex.Message);
                return false;
            }
        }

        public async Task<bool> DeletePlanById(int id)
        {
            var plan = await _context.TravelPlan.FindAsync(id);
            if (plan == null)
            {
                return false;
            }
            try
            {
                _context.TravelPlan.Remove(plan);
                await _context.SaveChangesAsync();
                return true;

            }catch(DbUpdateException ex)
            {
                Console.WriteLine(ex.Message);
                return false;
            }
        }

        public async Task<DateTime?> GetToDate(int id)
        {
            var plan = await _context.TravelPlan.FindAsync(id);
            if (plan == null)
            {
                return null;
            }
            return plan.EndDate;
        }

    }
}
