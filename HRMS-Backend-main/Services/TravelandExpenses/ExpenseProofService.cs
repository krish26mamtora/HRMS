using AutoMapper;
using HRMS_Backend.Data;
using HRMS_Backend.Entities.JobListing;
using HRMS_Backend.Entities.TravelandExpense;
using HRMS_Backend.Model.JobListing;
using HRMS_Backend.Model.TravelandExpense;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HRMS_Backend.Services.TravelandExpenses
{
    public class ExpenseProofService : IExpenseProofService
    {
        private readonly MyDbContext _context;
        private readonly IMapper _mapper;
        private readonly IWebHostEnvironment _hostingEnvironment;
        public ExpenseProofService(MyDbContext context, IMapper mapper , IWebHostEnvironment hostingEnvironment )
        {
            _context = context;
            _mapper = mapper;
            _hostingEnvironment = hostingEnvironment;
        }

        public async Task<ExpenseProofCreateUpdateDto?> getAssignedTravelPlayById(int id)
        {
            var expenseproof = await _context.TravelAssignment.FindAsync(id);
            return _mapper.Map<ExpenseProofCreateUpdateDto>(expenseproof);
        }
        public async Task<ExpenseProof> createExpenseProofAsync([FromForm] ExpenseProofCreateUpdateDto dto)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            string uniqueFileName = string.Empty;
            if (dto.ProofDocument == null)
            {
                // dont allow 
            }
            
            string uploadsFolder = Path.Combine(_hostingEnvironment.ContentRootPath, "UploadedExpenseProof");
            if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

            uniqueFileName = Guid.NewGuid().ToString() + "_" + Path.GetFileName(dto.ProofDocument.FileName);
            string filePath = Path.Combine(uploadsFolder, uniqueFileName);
            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await dto.ProofDocument.CopyToAsync(fileStream);
            }
           
            var expenseProof = new ExpenseProof
            {
                TravelExpenseId = dto.TravelExpenseId,
                ProofDocumentUrl = uniqueFileName,
                CreatedAt = dto.CreatedAt,
            };
            _context.ExpenseProof.Add(expenseProof);
            await _context.SaveChangesAsync();
            return expenseProof;
        }

        public async Task<ExpenseProofDisplayDto> getExpenseProofById(int id)
        {
            var expenseproof = await _context.ExpenseProof.FindAsync(id);
            if (expenseproof == null)
            {
                return null;
            }
            return _mapper.Map<ExpenseProofDisplayDto>(expenseproof);
        }

        public async Task<IEnumerable<ExpenseProofDisplayDto>> getExpenseProofByExpenseId(int id)
        {
            var expenseproof = await _context.ExpenseProof.Where(ep=>ep.TravelExpenseId==id).ToListAsync();
            if (expenseproof == null)
            {
                return null;
            }
            return _mapper.Map<IEnumerable<ExpenseProofDisplayDto>>(expenseproof);
        }
    }
}
