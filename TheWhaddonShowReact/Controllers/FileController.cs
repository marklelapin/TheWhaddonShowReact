using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;
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

		[HttpGet("download/media/{fileName}")]
		public async Task<IActionResult> Media(string fileName)
		{
			var mediaFolder = _fileSystem.Path.Combine("uploads/media");
			string filePath = _fileSystem.Path.Combine(mediaFolder, fileName);

			if (!_fileSystem.File.Exists(filePath))
			{
				return NotFound();
			}

			var provider = new FileExtensionContentTypeProvider();
			if (!provider.TryGetContentType(filePath, out string contentType))
			{
				contentType = "application/octet-stream";
			}

			try
			{

				var bytes = System.IO.File.ReadAllBytes(filePath);
				Response.Headers.Add("Content-Type", contentType);

				return File(bytes, contentType, fileName);
			}
			catch (Exception ex)
			{
				return StatusCode(500, ex.Message);
			}
		}


		[HttpPost("upload")]
		public async Task<IActionResult> Upload([FromForm] IFormFile file, [FromForm] string folder = "uploads")
		{
			if (file == null || file.Length == 0)
			{
				return BadRequest("No file selected");
			}

			try
			{
				var uploadsFolder = _fileSystem.Path.Combine(folder);
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

				return Content(uniqueFileName);
			}
			catch (Exception ex)
			{
				return StatusCode(500, ex.Message);
			}
		}


		[HttpPost("getFileTextContent")]
		public async Task<IActionResult> Import([FromForm] IFormFile file)
		{
			if (file == null || file.Length == 0)
			{
				return BadRequest("No file selected");
			}

			string fileContent = "";
			try
			{
				using (var reader = new StreamReader(file.OpenReadStream()))
				{
					fileContent = reader.ReadToEnd();
				}
			}
			catch (Exception ex)
			{
				return StatusCode(500, ex.Message);
			}

			return Ok(fileContent);

		}
	}
}
