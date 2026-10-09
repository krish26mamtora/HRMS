using AutoMapper;
using HRMS_Backend.Data;
using HRMS_Backend.Entities;
using HRMS_Backend.Entities.JobListing;
using HRMS_Backend.Model;
using HRMS_Backend.Model.JobListing;
using HRMS_Backend.Model.TravelandExpense;
using Microsoft.AspNetCore.Mvc;


//using HRMS_Backend.Services.Jobs;
using Microsoft.EntityFrameworkCore;

namespace HRMS_Backend.Services.JobListing
{
    public class JobService : IJobService
    {
        private readonly MyDbContext _context;
        private readonly IMapper _mapper;
        private readonly IWebHostEnvironment _hostingEnvironment;
        public JobService(MyDbContext context , IMapper mapper, IWebHostEnvironment hostingEnvironment = null)
        {
            _context = context;
            _mapper = mapper;
            _hostingEnvironment = hostingEnvironment;
        }
        public async Task<IEnumerable<JobResponseDto>> GetAllJobsAsync()
        {
            var Jobs = await _context.Jobs.ToListAsync();
            return _mapper.Map<IEnumerable<JobResponseDto>>(Jobs);
        }

        public async Task<IEnumerable<TravelResponseDto>> GetAllPlansAsync()
        {
            var plans = await _context.TravelPlan.ToListAsync();
            return _mapper.Map<IEnumerable<TravelResponseDto>>(plans);
        }
        public async Task<Jobs> CreateJobAsync([FromForm]  JobCreateUpdateDto dto)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            string uniqueFileName = string.Empty;
            if (dto.JdUrl != null)
            {
                string uploadsFolder = Path.Combine(_hostingEnvironment.ContentRootPath, "JD");
                if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

                uniqueFileName = Guid.NewGuid().ToString() + "_" + Path.GetFileName(dto.JdUrl.FileName);
                string filePath = Path.Combine(uploadsFolder, uniqueFileName);
                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.JdUrl.CopyToAsync(fileStream);
                }
            }

            var job = new Jobs
            {
                Title = dto.Title,
                Description = dto.Description,
                Status = dto.Status,
                ExpYearsReq = dto.ExpYearsReq,
                Role = dto.Role,
                JdUrl = uniqueFileName,
                ReviewerEmail = dto.ReviewerEmail,
                TotalPositions = dto.TotalPositions,
                ContactMail = dto.ContactMail,
                ManagedBy = dto.ManagedBy,
            };
            await _context.Jobs.AddAsync(job);
            await _context.SaveChangesAsync();
            return job;
        }
        public async Task<JobResponseDto?> GetJobByIdAsync(int id)
        {
            var Jobs = await _context.Jobs.FindAsync(id);
            var JobDtos = _mapper.Map<JobResponseDto>(Jobs);
            return JobDtos;
        }
    }
}
