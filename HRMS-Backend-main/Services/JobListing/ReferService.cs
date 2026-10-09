using AutoMapper;
using HRMS_Backend.Data;
using HRMS_Backend.Entities.JobListing;
//using HRMS_Backend.Migrations;
using HRMS_Backend.Model.JobListing;
using HRMS_Backend.Model.TravelandExpense;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HRMS_Backend.Services.JobListing
{
    public class ReferService : IReferService
    {
        private readonly MyDbContext _context;
        private readonly IMapper _mapper;
        private readonly IWebHostEnvironment _hostingEnvironment;

        public ReferService(MyDbContext context , IMapper mapper  , IWebHostEnvironment hostingEnvironment) { 
            _context = context;
            _mapper = mapper;
            _hostingEnvironment = hostingEnvironment;
        }
        public async Task<Referals> createReferalAsync([FromForm] JobRefferalCreateUpdateDto dto)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            string uniqueFileName = string.Empty;
            if (dto.ReffResume != null)
            {
                string uploadsFolder = Path.Combine(_hostingEnvironment.ContentRootPath, "UploadedResumes");
                if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

                uniqueFileName = Guid.NewGuid().ToString() + "_" + Path.GetFileName(dto.ReffResume.FileName);
                string filePath = Path.Combine(uploadsFolder, uniqueFileName);
                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.ReffResume.CopyToAsync(fileStream);
                }
            }
            var referal = new Referals
            {
                JobId = dto.JobId,
                ReffName = dto.ReffName,
                ReffMail = dto.ReffMail,
                ReffResumeUrl = uniqueFileName,
                EmpId = dto.EmpId,
                Description = dto.Description,
                CreatedAt = dto.CreatedAt,
            };
             _context.Referals.Add(referal);
            await _context.SaveChangesAsync();
            return referal;
        }

        public async Task<JobRefferalResponseDto> getReferalById(int id)
        {
            if (id == null)
            {
                throw new ArgumentNullException(nameof(id));
            }
            var Referals = await _context.Referals.FindAsync(id);
            var ReferalsDto = _mapper.Map<JobRefferalResponseDto>(Referals);
            return ReferalsDto;
        }

        public async Task<List<JobRefferalResponseDto>> getReferalByJobId(int id)
        {
            if (id == null)
            {
                throw new ArgumentNullException(nameof(id));
            }
            var Referals = await _context.Referals.Where(x=>x.JobId == id).ToListAsync();
            var ReferalsDto = _mapper.Map<List<JobRefferalResponseDto>>(Referals);
            return ReferalsDto;

        }
        public async Task<JobRefferalResponseDto> getReferalByUserId(int id)
        {
            if (id == null)
            {
                throw new ArgumentNullException(nameof(id));
            }
            var Referals = await _context.Referals.FirstOrDefaultAsync(x => x.EmpId == id);
            var ReferalsDto = _mapper.Map<JobRefferalResponseDto>(Referals);
            return ReferalsDto;

        }

        public async Task<bool> UpdateReferalWithId(int id , JobRefferalCreateUpdateDto dto)
        {
            var referal = await _context.Referals.FindAsync(id);
            if(referal == null)
            {
                return false;
            }
            _mapper.Map(dto, referal);
            try
            {
                _context.Referals.Update(referal);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (DbUpdateException ex)
            {
                Console.Write(ex.Message);
                return false;
            }
        }
    }
}
