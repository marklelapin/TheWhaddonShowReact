using Azure.Storage.Blobs;
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


		//[HttpGet("fetch/{containerName}/{fileName}")]
		//public async Task<IActionResult> Fetch(string containerName, string fileName)
		//{
		//	//TODO - issue in GitHub - this is currently being done through direct api call in the client. Need to create interface with download, upload and fetch file methods and extract out of client.
		//}


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
				container.Create();

				var blob = container.GetBlobClient(uniqueBlobName);
				await blob.UploadAsync(file.OpenReadStream());
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
