using AutoMapper;
using HRMS_Backend.Data;
using HRMS_Backend.Entities.TravelandExpense;
using HRMS_Backend.Model.TravelandExpense;
using Microsoft.EntityFrameworkCore;

namespace HRMS_Backend.Services.TravelandExpenses
{
    public class TravelDocumentsService :ITravelDocumentsService
    {
        private readonly MyDbContext _context;
        private readonly IMapper _mapper;
        private readonly IWebHostEnvironment _hostingEnvironment;
        public TravelDocumentsService(MyDbContext context, IMapper mapper , IWebHostEnvironment hostingEnvironment  )
        {
            _context = context;
            _mapper = mapper;
            _hostingEnvironment = hostingEnvironment;
        }
        public async Task<TravelDocuments> uploadTravelDocument(TravelDocumentsCreateUpdateDto dto)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            string uniqueFileName = string.Empty;
            string uploadsFolder = Path.Combine(_hostingEnvironment.ContentRootPath, "TravelDocuments");
            if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

            uniqueFileName = Guid.NewGuid().ToString() + "_" + Path.GetFileName(dto.TravelDocument.FileName);
            string filePath = Path.Combine(uploadsFolder, uniqueFileName);
            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await dto.TravelDocument.CopyToAsync(fileStream);
            }
            var TravelDocument = new TravelDocuments
            {
                Id = dto.Id,
                UploadedBy = dto.UploadedBy,
                Type = dto.Type,
                Description = dto.Description,
                TravelAssignmentId = dto.TravelAssignmentId,
                TravelDocumentUrl = uniqueFileName,
                CreatedAt = dto.CreatedAt 
            };
          
            _context.TravelDocuments.Add(TravelDocument);
            await _context.SaveChangesAsync();
            return TravelDocument;
        }

        public async Task<TravelDocumentsDisplayDto> getDocumentsByTravelDocumentId(int id)
        {
            var traveldocument = await _context.TravelDocuments.FindAsync(id);
            if (traveldocument == null)
            {
                return null;
            }
            return _mapper.Map<TravelDocumentsDisplayDto>(traveldocument);
        }

        public async Task<List<TravelDocumentsDisplayDto>> getDocumentsByTravelAssignedId(int id)
        {
            var expense = await _context.TravelDocuments.Where(ex => ex.TravelAssignmentId == id).ToListAsync();
            if (expense == null)
            {
                return null;
            }
            return _mapper.Map<List<TravelDocumentsDisplayDto>>(expense);
        }
    }
}
