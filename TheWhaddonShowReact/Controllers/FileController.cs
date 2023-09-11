using Microsoft.AspNetCore.Mvc;
using System.IO.Abstractions;

namespace TheWhaddonShowReact.Controllers
{
	[ApiController]
	[Route("api/[controller]")]
	public class FileController : ControllerBase
	{
		private readonly IFileSystem _fileSystem;

		public FileController(IFileSystem fileSystem)
		{
			_fileSystem = fileSystem;
		}

		[HttpGet]
		public IActionResult Get()
		{
			return Ok("Test");
		}


		[HttpPost("upload")]
		public async Task<IActionResult> Upload([FromForm] IFormFile file)
		{
			if (file == null || file.Length == 0)
			{
				return BadRequest("No file selected");
			}

			try
			{
				var uploadsFolder = _fileSystem.Path.Combine("uploads");
				if (!_fileSystem.Directory.Exists(uploadsFolder))
				{
					_fileSystem.Directory.CreateDirectory(uploadsFolder);
				}

				var uniqueFileName = Guid.NewGuid().ToString() + "_" + file.FileName;
				var filePath = _fileSystem.Path.Combine(uploadsFolder, uniqueFileName);

				using (var stream = _fileSystem.File.Create(filePath))
				{
					await file.CopyToAsync(stream);
				}

				return Ok("File uploaded successfully.");
			}
			catch (Exception ex)
			{
				return StatusCode(500, ex.Message);
			}
		}
	}
}
