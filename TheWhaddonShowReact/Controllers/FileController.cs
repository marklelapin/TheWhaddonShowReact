using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using ImageMagick;
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

					int maxAge = 60 * 60 * 24 * 180; // 180 days

					Response.Headers.Add("Cache-Control", $"public, max-age={maxAge}");

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
		public async Task<IActionResult> Upload([FromForm] IFormFile file, [FromQuery] string containerName, [FromQuery] int? width, [FromQuery] int? height, [FromQuery] int compressionQuality = 100)
		{
			if (file == null || file.Length == 0) { return BadRequest("No file selected"); }
			if (containerName == null) { return BadRequest("No container name supplied"); }
			if (containerName != "media" &&
				containerName != "avatars") { return BadRequest("Invalid container name supplied"); }


			string uniqueBlobName = Guid.NewGuid().ToString() + "_" + file.FileName;
			var container = new BlobContainerClient(_connectionString, containerName);
			var blob = container.GetBlobClient(uniqueBlobName);


			if (file.ContentType.Contains("image"))
			{
				try
				{

					using (var originalStream = file.OpenReadStream())
					{

						using (var stream = new MemoryStream())
						{
							await originalStream.CopyToAsync(stream);
							stream.Position = 0;

							using (MagickImage image = new MagickImage(stream))
							{

								if (width.HasValue && height.HasValue)
								{
									image.Resize(new MagickGeometry(width.Value, height.Value));
								}

								image.Quality = compressionQuality;

								image.Write(stream);
							}

							stream.Position = 0;
							var optimizer = new ImageOptimizer();
							optimizer.Compress(stream);

							stream.Position = 0;
							await blob.UploadAsync(stream, true);
						}
					}
				}
				catch (Exception ex)
				{
					throw new Exception("Error resizing image", ex);
				}
			}
			else
			{
				try
				{
					await blob.UploadAsync(file.OpenReadStream(), new BlobHttpHeaders
					{
						ContentType = file.ContentType
					});
				}
				catch (Exception ex)
				{
					throw new Exception("Error uploading file", ex);
				}
			}

			return Ok(uniqueBlobName);

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
					fileContent = await reader.ReadToEndAsync();
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
