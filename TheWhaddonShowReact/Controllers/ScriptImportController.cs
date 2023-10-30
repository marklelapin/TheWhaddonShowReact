using Microsoft.AspNetCore.Mvc;
using System.IO.Abstractions;
using System.Text;
using System.Text.Json;
using TheWhaddonShowClassLibrary.Models;
using TheWhaddonShowReact.Models.LocalServer;


namespace TheWhaddonShowReact.Controllers
{
	/// <summary>
	/// Contains all the methods for taking a text file/word document and converting it to scriptItems using OpenAI api.
	/// </summary>
	[ApiController]
	[Route("api/[controller]")]
	public class ScriptImportController : ControllerBase
	{
		private readonly IFileSystem _fileSystem;
		private readonly IConfiguration _config;
		private readonly IHttpClientFactory _factory;
		private readonly string ServiceName = "OpenAI";
		private readonly string _openAIKey;

		private string ImportFolder = "import";

		private List<ImportLine> ImportLines = new List<ImportLine>();

		public List<ScriptItemUpdate> NewScriptItemUpdates = new List<ScriptItemUpdate>();
		public List<PartUpdate> NewPartUpdates = new List<PartUpdate>();

		public ScriptImportController(IFileSystem fileSystem, IConfiguration config, IHttpClientFactory factory)
		{
			_fileSystem = fileSystem;
			_config = config;
			_factory = factory;
			_openAIKey = _config.GetValue<string>("OpenAIKey");
		}

		[HttpPost("import")]
		public async Task<IActionResult> Import([FromForm] IFormFile file)
		{
			if (file == null || file.Length == 0)
			{
				return BadRequest("No file selected");
			}

			string fileContent;
			try

			{
				using (var reader = new StreamReader(file.OpenReadStream()))
				{
					fileContent = reader.ReadToEnd();
				}

				(ImportHeader header, List<ImportLine> importLines) = await extractFileContent(fileContent);

				SetParts(header);

				SetScriptItems(header, importLines);

			}
			catch (Exception ex)
			{
				return StatusCode(500, ex.Message);
			}

			string importResponse = JsonSerializer.Serialize(new ImportResponse(NewPartUpdates, NewScriptItemUpdates));

			return Ok(importResponse);

		}

		/// <summary>
		/// Extracts the relevant information from the fileContent using OpenAI
		/// </summary>
		/// <param name="fileContent"></param>
		/// <returns></returns>
		async Task<(ImportHeader header, List<ImportLine> importLines)> extractFileContent(string fileContent)
		{
			// Get the headerinfo from OpenAI analysis of the fileContent
			string firstPrompt = "Identify the scene title, synopsis, parts, initial_staging and first_line of the scene. Return the information in a json string.";

			string headerInfo = await GetOpenAIResponse(firstPrompt, fileContent);

			ImportHeader header = JsonSerializer.Deserialize<ImportHeader>(headerInfo) ?? new ImportHeader();

			List<ImportLine> importLines = new List<ImportLine>();

			//split the fileContent into chunks of lines to keep OpenAI tokens below max limit

			List<string> fileContentLines = fileContent.Split("\n").ToList();

			for (int i = 0; i < fileContentLines.Count; i += 8)
			{

				string fileContentChunk = string.Join("\n", fileContentLines.Skip(i).Take(8));


				string prompt = "For each line of this script identify its type as either 'action', 'dialogue', 'sound','lighting'." +
					"Actions tend to be surrounded by brackets with nothing else on the line." +
					"If type is dialogue or action identify the parts associated with the text" +
					$"Parts can be any from [{string.Join(",", header.Parts)}]." +
					"Return a json string with an array of objects for each line with type, parts(as an array) and text as properties.";

				string responseJson = await GetOpenAIResponse(prompt, fileContentChunk);

				List<ImportLine> responseArray = JsonSerializer.Deserialize<List<ImportLine>>(responseJson) ?? new List<ImportLine>();

				ImportLines = ImportLines.Concat(responseArray).ToList();

			}


			return (header, importLines);

		}


		async Task<string> GetOpenAIResponse(string systemPrompt, string userPrompt)
		{
			var contentObject = new
			{
				model = "gpt-3.5-turbo",
				messages = new[]
				{
					new {
						role = "system",
						content = systemPrompt
					}
					,new {
						role = "user",
						content =  userPrompt
					}
				},
				max_tokens = 4097,
				temperature = 0,
				top_p = 1,
				frequency_penalty = 0,
				presence_penalty = 0,
			};

			var contentJson = JsonSerializer.Serialize(contentObject);

			var httpContent = new StringContent(contentJson, Encoding.UTF8, "application/json");

			var client = _factory.CreateClient(ServiceName);
			HttpResponseMessage response = await client.PostAsync("", httpContent);

			var responseContent = response.Content.ReadAsStringAsync().Result;

			return responseContent;
		}


		void SetParts(ImportHeader header)
		{
			List<PartUpdate> partUpdates = new List<PartUpdate>();

			foreach (string part in header.Parts)
			{
				PartUpdate newPart = new PartUpdate(part);
				partUpdates.Add(newPart);
			}

			NewPartUpdates = partUpdates;
		}


		void SetScriptItems(ImportHeader header, List<ImportLine> importLines)
		{
			//Create header script items
			ScriptItemUpdate scene = new ScriptItemUpdate("Scene");
			scene.Text = header.Title;
			scene.PartIds = NewPartUpdates.Select(x => x.Id).ToList();

			ScriptItemUpdate synopsis = new ScriptItemUpdate("Synopsis");
			scene.Text = header.Synopsis;

			ScriptItemUpdate initialStaging = new ScriptItemUpdate("InitialStaging");
			scene.Text = header.InitialStaging;

			ScriptItemUpdate initialCurtain = new ScriptItemUpdate("InitialCurtain");
			scene.Text = header.InitialCurtain;

			//add next, previous  and parent ids to header script items
			scene.NextId = synopsis.Id;

			synopsis.PreviousId = scene.Id;
			synopsis.NextId = initialStaging.Id;
			synopsis.ParentId = scene.Id;

			initialStaging.PreviousId = synopsis.Id;
			initialStaging.NextId = initialCurtain.Id;
			initialStaging.ParentId = scene.Id;

			initialCurtain.PreviousId = initialStaging.Id;
			initialCurtain.NextId = null;//established after script items created below.
			initialCurtain.ParentId = scene.Id;


			//create body script items
			List<ScriptItemUpdate> scriptItems = new List<ScriptItemUpdate>();

			foreach (ImportLine line in importLines)
			{
				try
				{
					ScriptItemUpdate scriptItem = new ScriptItemUpdate(Guid.NewGuid(), scene.Id, line.Type, getPartUpdates(line.Parts), null);
					scriptItem.Text = line.Text ?? "";
					scriptItems.Add(scriptItem);
				}
				catch
				{
					if (line.Text != null || line.Text?.Length > 0)
					{
						//if it fails but there is text then produce an action.
						ScriptItemUpdate scriptItem = new ScriptItemUpdate(Guid.NewGuid(), scene.Id, "Action", null, null);
						scriptItem.Text = line.Text;
						scriptItems.Add(scriptItem);
					}

					//do nothing. if whatever reason the respon from OpenAI is not valid and doesn't have text then just ignore it.
				}
			}

			//add next, previous and parent ids to body script items

			for (int i = 0; 1 < scriptItems.Count; i++)
			{
				scriptItems[i].PreviousId = scriptItems[i - 1]?.Id;
				scriptItems[i].NextId = scriptItems[i + 1]?.Id;
				scriptItems[i].ParentId = scene.Id;
			}

			//link header and body script items
			initialCurtain.NextId = scriptItems[0].Id;
			scriptItems[0].PreviousId = initialCurtain.Id;


			NewScriptItemUpdates = scriptItems;

		}



		private List<PartUpdate> getPartUpdates(List<string> partNames)
		{
			List<PartUpdate> partUpdates = new List<PartUpdate>();

			foreach (string name in partNames)
			{
				PartUpdate partUpdate = NewPartUpdates.FirstOrDefault(x => x.Name == name)!;

				if (partUpdates != null)
				{
					partUpdates.Add(partUpdate);
				}
			}

			return partUpdates;
		}

	}
}
