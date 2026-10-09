using HRMS_Backend.Entities.JobListing;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRMS_Backend.Controllers.JobListing
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class FileController :ControllerBase
    {
        [HttpPost]
        public ActionResult Post([FromForm] FileModel2 file)
        {
            try
            {
                string path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", file.FileName);
                using (Stream stream = new FileStream(path, FileMode.Create))
                {
                    file.FormFile.CopyTo(stream);
                }
                return StatusCode(StatusCodes.Status201Created);
            }catch(Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }
    }
}
