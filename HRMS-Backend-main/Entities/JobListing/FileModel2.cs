using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HRMS_Backend.Entities.JobListing
{
    public class FileModel2
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]

        public int Id { get; set; }
        public string FileName {  get; set; }

        [NotMapped]
        public IFormFile FormFile { get; set; }

    }
}
