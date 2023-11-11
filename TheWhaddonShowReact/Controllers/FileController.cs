using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.AspNetCore.Mvc;


namespace TheWhaddonShowReact.Controllers
{
	[ApiController]
	[Route("api/[controller]")]
	public class FileController : ControllerBase
	{
		private string _connectionString;

		public FileController(IConfiguration config) // TODO should be taking in IFileControllerService
		{
			_connectionString = config.GetValue<string>("ConnectionStrings:AzureBlobStorage");
		}


		[HttpGet()]
		public async Task<IActionResult> Get([FromQuery] string containerName, [FromQuery] string fileName)
		{
			try
			{
				var blobServiceClient = new BlobServiceClient(_connectionString);
				var containerClient = blobServiceClient.GetBlobContainerClient(containerName);
				var blobClient = containerClient.GetBlobClient(fileName);

				if (await blobClient.ExistsAsync())
				{
					BlobDownloadInfo download = await blobClient.DownloadAsync();
					var contentType = download.ContentType;
					Stream blobStream = download.Content;
					return File(blobStream, contentType, fileName);
				}
				return NotFound();
			}
			catch (Exception ex)
			{
				return StatusCode(500, "Error in file controller fetching file:" + ex.Message);
			}

		}


		[HttpPost("upload")]
		public async Task<IActionResult> Upload([FromForm] IFormFile file, [FromQuery] string containerName)
		{
			if (file == null || file.Length == 0) { return BadRequest("No file selected"); }
			if (containerName == null) { return BadRequest("No container name supplied"); }
			if (containerName != "media" &&
				containerName != "avatars") { return BadRequest("Invalid container name supplied"); }
			try
			{
				string uniqueBlobName = Guid.NewGuid().ToString() + "_" + file.FileName;


				var container = new BlobContainerClient(_connectionString, containerName);

				var blob = container.GetBlobClient(uniqueBlobName);
				await blob.UploadAsync(file.OpenReadStream(), new BlobHttpHeaders { ContentType = file.ContentType });
				return Ok(uniqueBlobName);
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
