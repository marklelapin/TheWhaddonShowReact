using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.AspNetCore.Mvc;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.Processing;

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
		public async Task<IActionResult> Upload([FromForm] IFormFile file, [FromQuery] string containerName, [FromQuery] int? width, [FromQuery] int? height)
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
							Image image = Image.Load(stream);

							if (width.HasValue && height.HasValue)
							{
								image.Mutate(x => x.Resize(width.Value, height.Value));
								stream.Position = 0;
							}


							image.Save(stream, new JpegEncoder());
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
					fileContent = reader.ReadToEnd();
				}
			}
			catch (Exception ex)
			{
				return StatusCode(500, ex.Message);
			}

			return Ok(fileContent);

		}


		private void ResizeImage(Image image, Stream outputStream, int? width = null, int? height = null)
		{

			try
			{
				if (width.HasValue && height.HasValue)
				{
					image.Mutate(x => x.Resize(width.Value, height.Value));
				}

				image.SaveAsJpeg(outputStream, new JpegEncoder());

				outputStream.Seek(0, SeekOrigin.Begin);


			}
			catch (Exception ex)
			{
				throw new Exception("Error resizing image", ex);
			}


		}


	}

}
