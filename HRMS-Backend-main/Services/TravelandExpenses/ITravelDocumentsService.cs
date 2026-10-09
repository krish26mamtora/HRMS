using HRMS_Backend.Entities.TravelandExpense;
using HRMS_Backend.Model.TravelandExpense;

namespace HRMS_Backend.Services.TravelandExpenses
{
    public interface ITravelDocumentsService
    {
        Task<TravelDocuments> uploadTravelDocument(TravelDocumentsCreateUpdateDto dto);
        Task<TravelDocumentsDisplayDto> getDocumentsByTravelDocumentId(int id);
        Task<List<TravelDocumentsDisplayDto>> getDocumentsByTravelAssignedId(int id);
    }
}
