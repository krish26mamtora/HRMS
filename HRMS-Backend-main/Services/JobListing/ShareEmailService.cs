using AutoMapper;
using HRMS_Backend.Data;
using HRMS_Backend.Entities.JobListing;
using HRMS_Backend.Model.JobListing;

namespace HRMS_Backend.Services.JobListing
{
    public class ShareEmailService : IShareEmailService
    {
        private readonly MyDbContext _context;
        private readonly IMapper _mapper;
        public ShareEmailService(MyDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

    }
}
