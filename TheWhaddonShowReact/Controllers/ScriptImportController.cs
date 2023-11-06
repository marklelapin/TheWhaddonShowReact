using Microsoft.AspNetCore.Mvc;
using MyClassLibrary.Configuration;
using MyClassLibrary.Interfaces;
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
		private readonly IOpenAIControllerService _openAIControllerService;

		private ImportHeader Header = new ImportHeader();
		private List<ImportLine> ImportLines = new List<ImportLine>();

		public List<ScriptItemUpdate> NewScriptItemUpdates = new List<ScriptItemUpdate>();
		public List<PartUpdate> NewPartUpdates = new List<PartUpdate>();

		public ScriptImportController(IOpenAIControllerService openAIControllerService)
		{
			_openAIControllerService = openAIControllerService;
		}

		[HttpPost("convertTextToHeaderScriptItems")]
		public async Task<IActionResult> ConvertTextToHeaderScriptItems([FromBody] string text) //, [FromQuery] Guid parentId
		{
			if (text == null || text.Length == 0)
			{
				return BadRequest("No text given to import controller.");
			}

			try

			{
				string firstPrompt = "Identify the scene 'title', 'synopsis', 'initialStaging' and 'parts' of the scene." +
					"Return the information as a RFC8259 compliant json string with parts as an array.";

				var firstResponse = await _openAIControllerService.GetChatCompletionContent(firstPrompt, text, null);

				if (firstResponse is ObjectResult objectResult)
				{
					if (objectResult.StatusCode == 200)
					{
						ImportHeader header = JsonSerializer.Deserialize<ImportHeader>((string)objectResult.Value!) ?? new ImportHeader();
						List<PartUpdate> headerParts = createParts(header);
						var headerScriptItems = createHeaderScriptItems(header, headerParts); //, parentId

						var options = new JsonSerializerOptions
						{
							PropertyNamingPolicy = new CamelCaseNamingPolicy()
						};

						return Ok(JsonSerializer.Serialize(new ImportResponse(headerScriptItems, headerParts), options));
					}
					else
					{
						return StatusCode((int)(objectResult.StatusCode ?? 500), objectResult.Value);
					}
				}

				throw new Exception("");
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"Error getting response from OpenAI Api: {ex.Message}");
			}

		}


		[HttpPost("convertTextToScriptItems")]
		public async Task<IActionResult> ConvertTextToScriptItems([FromBody] string text,
																	[FromQuery] string[] partNames,
																	[FromQuery] Guid[] partIds,
																	[FromQuery] Guid parentId
			)
		{
			List<ScriptItemUpdate> scriptItemsOutput = new List<ScriptItemUpdate>();

			try
			{
				////split the fileContent into chunks of lines to keep OpenAI tokens below max limit
				List<string> fileContentLines = text.Split("\n").ToList();



				//then process fileContent in chunks
				int chunkSize = 1;
				for (int i = 0; i < fileContentLines.Count; i += chunkSize)
				{
					string textChunk = string.Join("\n", fileContentLines.Skip(i).Take(chunkSize));
					//Then for all chunks of lines get OpenAI to identify the type and text of each line and the parts associated with it.

					string prompt = "For each line of theatre script identify the type as Staging, Action, Dialogue, Sound or Lighting." +
						"Actions tend to be surrounded by brackets with nothing else on the line. If unsure make it Action." +
						"If type is Dialogue identify the parts (if any) associated with the text. they will be at the start and separated from the dialogue." +
						"Try to associated the parts with one of the following: " + partNames.ToString() + "." +
						"Return a RFC8259 compliant json string only with an array of objects for each line with type, parts(as an array) and text as properties.";

					var response = await _openAIControllerService.GetChatCompletionContent(prompt, textChunk, null);

					if (response is ObjectResult objectResult)
					{
						if (objectResult.StatusCode == 200)
						{
							List<ImportLine> listImportLines = JsonSerializer.Deserialize<List<ImportLine>>((string)objectResult.Value!) ?? new List<ImportLine>();
							scriptItemsOutput.AddRange(createScriptItems(listImportLines, parentId, partNames, partIds));
						}
						else
						{
							return StatusCode((int)(objectResult.StatusCode ?? 500), objectResult.Value);
						}
					}
					else
					{
						throw new Exception("");
					}

				}
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"Error getting response from OpenAI Api: {ex.Message}");
			}

			var options = new JsonSerializerOptions
			{
				PropertyNamingPolicy = new CamelCaseNamingPolicy()
			};
			string importResponse = JsonSerializer.Serialize(new ImportResponse(scriptItemsOutput), options);

			return Ok(importResponse);
		}

		List<PartUpdate> createParts(ImportHeader header)
		{
			List<string> parts = header.parts;

			List<PartUpdate> partUpdates = new List<PartUpdate>();

			foreach (string part in parts)
			{
				PartUpdate newPart = new PartUpdate(part);
				partUpdates.Add(newPart);
			}

			return partUpdates;
		}

		private List<ScriptItemUpdate> createHeaderScriptItems(ImportHeader header, List<PartUpdate> headerParts) //, Guid parentId
		{
			//Create header script items
			ScriptItemUpdate scene = new ScriptItemUpdate("Scene"); //parentId, null, 
			scene.Text = header.title;
			scene.PartIds = headerParts.Select(x => x.Id).ToList();

			ScriptItemUpdate synopsis = new ScriptItemUpdate("Synopsis");
			synopsis.Text = header.synopsis;

			ScriptItemUpdate initialStaging = new ScriptItemUpdate("InitialStaging");
			initialStaging.Text = header.initialStaging;

			ScriptItemUpdate initialCurtain = new ScriptItemUpdate("InitialCurtain");
			initialCurtain.Tags = new List<string>() { "OpenCurtain" };
			//scene.Text = header.InitialCurtain;

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

			List<ScriptItemUpdate> scriptItemUpdates = new List<ScriptItemUpdate>()
			{
				scene,
				synopsis,
				initialStaging,
				initialCurtain
			};

			return scriptItemUpdates;
		}


		List<ScriptItemUpdate> createScriptItems(List<ImportLine> importLines, Guid parentId, string[] partNames, Guid[] partIds)
		{
			Dictionary<string, Guid> partDictionary = new Dictionary<string, Guid>();

			for (int i = 0; i < partNames.Length; i++)
			{
				partDictionary.Add(partNames[i], partIds[i]);
			}


			//create body script items
			List<ScriptItemUpdate> scriptItems = new List<ScriptItemUpdate>();

			foreach (ImportLine line in importLines)
			{
				try
				{
					List<Guid> parts = new List<Guid>();

					foreach (string partName in line.parts)
					{
						parts.Add(partDictionary[partName]);
					}

					ScriptItemUpdate scriptItem = new ScriptItemUpdate(Guid.NewGuid(), parentId, line.type, null, null);
					scriptItem.Text = line.text ?? "";
					scriptItem.PartIds = parts;
					scriptItems.Add(scriptItem);
				}
				catch
				{
					if (line.text != null || line.text?.Length > 0)
					{
						//if it fails but there is text then produce an action.
						ScriptItemUpdate scriptItem = new ScriptItemUpdate(Guid.NewGuid(), parentId, "Action", null, null);
						scriptItem.Text = line.text;
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
				scriptItems[i].ParentId = parentId;
			}

			return scriptItems;

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
