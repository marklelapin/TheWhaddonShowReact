
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MyClassLibrary.Interfaces;
using MyClassLibrary.OpenAI;
using System.Reflection;
using System.Text.Json;
using TheWhaddonShowReact.Models.LocalServer;
using Xunit.Sdk;

namespace TheWhaddonShowReactUnitTesting
{
	[Collection("Startup")]
	public class ScriptImportTests
	{

		private readonly IOpenAIControllerService _openAIControllerService;


		public ScriptImportTests()
		{

			string assemblyPath = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location)!;

			//ConfigureServices() for testing of OpenAIControllerService which requires IHttpClientFactory and IConfiguration.
			//This is more integration testing than unit testing but it is useful to have, is run on ad Hoc basis and is readonly in regards to external services.
			var configuration = new ConfigurationBuilder()
				.SetBasePath(Directory.GetCurrentDirectory())
				.AddUserSecrets<ScriptImportTests>()
				.Build();

			var services = new ServiceCollection();

			services.AddHttpClient("OpenAI", opts =>
			{
				opts.BaseAddress = new Uri(configuration.GetValue<string>("OpenAIApi:BaseUrl")!);
				opts.DefaultRequestHeaders.Add("Authorization", $"Bearer {configuration.GetValue<string>("OpenAIApi:ApiKey")}");
			});
			services.AddSingleton<IConfiguration>(configuration);
			services.AddTransient<IOpenAIControllerService, OpenAIControllerService>();

			var serviceProvider = services.BuildServiceProvider();

			_openAIControllerService = serviceProvider.GetRequiredService<IOpenAIControllerService>();

		}




		private static string systemHeaderPrompt = "You are a maching returning AN RFC8259 COMPLIANT JSON STRING!" +
			" with an object of properties 'title', 'synopsis', 'initialStaging' and 'parts' (as Array)." +
					"Identify the 'title', 'synopsis', 'initialStaging' and 'parts' of the scene .";

		private static string systemBodyPrompt = "You are a machine transcribing a section of a theatre play script into AN ITERABLE RFC8259 COMPLIANT JSON STRING!" +
			"with an array of objects in the format {type: string, parts: string[],text: string}." +
			"type MUST be either 'dialogue' or 'action'. default to 'action'." +
			"if action parts = []." +
			"if dialogue identify the parts speaking the dialogue." +
			"parts MUST be one or more of 'Ms Collin','Voiceover', 'Richard', 'Rose','Shirley','Charlotte','Sharon' or 'Benjamin'. " +
			"text for these json objects will be the dialogue spoken by the parts identified. "
						;

		private static string userPromptHeaderSection = @$"1.	Whaddon Hall Secondary Roll Call
				Angry inner-city schoolteacher takes registration and gets mad at mispronunciations
				Staging: In front of curtain
				Props: Table with Books and Paper on (to be swept off). Staging for School Days setup behind curtain.
				Parts: Whaddon Hall Headteacher (Ms Collin), Voiceover (Graham Stewart), Richard, Rose, Shirley, Charlotte, Sharon, Benjamin

				Voiceover: 		Meanwhile at Whaddon Hall Secondary School a different kind of registration is taking place…

				Ms Collin:	All right, listen up you lot. I’m your headteacher Ms Collin, I taught school for 20 years in the most deprived parts of the Northern Territories and don’t mean Stony Stratford so if you hard nuts from the Whaddon Hall Estate think you’re going to get one over me you’ve got another thing coming. Do you get me? Okay, let’s take the register. Charlene….Charlene….Charlene Calder I know you’re here.
				Charlotte:		Do you mean Charlotte?";

		private static string userPromptHeaderSectionWithAction = @$"1.	Whaddon Hall Secondary Roll Call
				Angry inner-city schoolteacher takes registration and gets mad at mispronunciations
				Staging: In front of curtain
				Props: Table with Books and Paper on (to be swept off). Staging for School Days setup behind curtain.
				Parts: Whaddon Hall Headteacher (Ms Collin), Voiceover (Graham Stewart), Richard, Rose, Shirley, Charlotte, Sharon, Benjamin

				Voiceover: 		Meanwhile at Whaddon Hall Secondary School a different kind of registration is taking place…

				(curtain opens)

				Ms Collin:	All right, listen up you lot. I’m your headteacher Ms Collin, I taught school for 20 years in the most deprived parts of the Northern Territories and don’t mean Stony Stratford so if you hard nuts from the Whaddon Hall Estate think you’re going to get one over me you’ve got another thing coming. Do you get me? Okay, let’s take the register. Charlene….Charlene….Charlene Calder I know you’re here.
				Charlotte:		Do you mean Charlotte?";



		private static string userPromptBodySection15 = @$"Ms Collin:	Good. Sheila Vincent.
Shirley:	Shirley?
Ms Collin:	Are you testing me Sheila?
Shirley:	It’s Shirley?
Ms Collin:	Nah. Say it properly.
Shirley:	Shirley?
Ms Collin:	No
Shirley:	Shirley
Ms Collin:	No. Say it Right.
Shirley:	Sheila
Ms Collin:	Correct. Anyone else want to play? Is that how it’s going to be?
(pause) 
Richard.  Richard Boat – 		eng
Richard:	It’s actually Boateng.
Ms Collin:	That’s what I said Boat –     eng.
Richard:	No it’s Boateng.";

		private static string userPromptBodySection8 = @$"Ms Collin:	Good. Sheila Vincent.
Shirley:	Shirley?
Ms Collin:	Are you testing me Sheila?
Shirley:	It’s Shirley?
Ms Collin:	Nah. Say it properly.
Shirley:	Shirley?
Ms Collin:	No
Shirley:	Shirley
Ms Collin:	No. Say it Right.";

		private static string userPromptBodySection4 = @$"Ms Collin:	Good. Sheila Vincent.
Shirley:	Shirley?
Ms Collin:	Are you testing me Sheila?
Shirley:	It’s Shirley?
Ms Collin:	Nah. Say it properly.";

		private static string userPromptBodySection2 = @$"Ms Collin:	Good. Sheila Vincent.
Shirley:	Shirley?
Ms Collin:	Are you testing me Sheila?";

		private static string userPromptWholeScene = $@"3.	Whaddon Hall Secondary Roll Call
Angry inner-city schoolteacher takes registration and gets mad at mispronunciations
Staging: In front of curtain
Props: Table with Books and Paper on (to be swept off). Staging for School Days setup behind curtain.
Parts: Whaddon Hall Headteacher (Ms Collin), Voiceover (Graham Stewart), Richard, Rose, Shirley, Charlotte, Sharon, Benjamin

Voiceover: 		Meanwhile at Whaddon Hall Secondary School a different kind of registration is taking place…

Ms Collin:	All right, listen up you lot. I’m your headteacher Ms Collin, I taught school for 20 years in the most deprived parts of the Northern Territories and don’t mean Stony Stratford so if you hard nuts from the Whaddon Hall Estate think you’re going to get one over me you’ve got another thing coming. Do you get me? Okay, let’s take the register. Charlene….Charlene….Charlene Calder I know you’re here.
Charlotte:		Do you mean Charlotte?
Ms Collin: 		No I mean Charlene.
Charlotte:		Ok sorry. If that’s what you prefer. I think that’s me yes.
Ms Collin: 		That’s what I want class. Some respect. 						Bruce…Bruce Burnett…		
Benjamin:		I’m Benjamin Burnett.
Ms Collin:		I said Bruce.
Benjamin:		Well my name’s Benjamin Burnett. I think you might have got it wrong.
Ms Collin:	Are you out of your bloody mind Bruce….are you really saying I’m wrong Bruce. Do you want to go to war?	
Benjamin:	I guess not.
Ms Collin:	Good. Sheila Vincent.
Shirley:	Shirley?
Ms Collin:	Are you testing me Sheila?
Shirley:	It’s Shirley?
Ms Collin:	Nah. Say it properly.
Shirley:	Shirley?
Ms Collin:	No
Shirley:	Shirley
Ms Collin:	No. Say it Right.
Shirley:	Sheila
Ms Collin:	Correct. Anyone else want to play? Is that how it’s going to be?
(pause) 
Richard.  Richard Boat – 		eng
Richard:	It’s actually Boateng.
Ms Collin:	That’s what I said Boat –     eng.
Richard:	No it’s Boateng.
Ms Collin: 	Boateng
Richard: 	It’s Boateng. It’s actually the 4th most common surname in Ghana.
Ms Collin:	Do I look like a care Boat - eng.
Richard:	Boateng.
Ms Collin: 	God damn it. Boateng. I don’t any more.
Rose
Rose
Rose Ambler Boat-eng
Rose:	Ambler-Boateng
Ms Collin:	God damn it!
(Snaps clipboard in half)
Ms Collin:		Sheila
Shirley:		I think you’ve already done me.
Ms Collin:		Not you. The other Sheila. Sheila Bess-elle
Sharon:		It’s actually Sharon.
Ms Collin:		Son of a .....(sweeps books off the table)

Lighting: Lights Out!

(Goes straight into School Day…)
";



		public static readonly object[][] getImportHeaderTestData =
			{
				new object[]{systemHeaderPrompt,userPromptHeaderSection,200},
				new object[]{systemHeaderPrompt,userPromptWholeScene,200}

		};
		[Theory, MemberData(nameof(getImportHeaderTestData))]
		public async Task GetImportHeaderTest(string systemPrompt, string userPrompt, int expectedStatusCode)
		{
			var content = await _openAIControllerService.GetChatCompletionContent(systemPrompt, userPrompt, options =>
			{
				options.Temperature = 0.2f;
			});

			if (content is ObjectResult objectResult)
			{
				Assert.Equal(expectedStatusCode, objectResult.StatusCode);
				Assert.Equal(typeof(string), objectResult.Value.GetType());
				Assert.True(((string)objectResult.Value).Length > 0);

				try { JsonSerializer.Deserialize<object>((string)objectResult.Value); }
				catch (Exception ex) { throw new XunitException($"Test failed as content is not a RFC8259 compliant json string. {ex.Message}"); }

				try { JsonSerializer.Deserialize<ImportHeader>((string)objectResult.Value); }
				catch (Exception ex) { throw new XunitException($"Test failed as Json object returned could not be deserialised to ImportHeader. {ex.Message}"); }

			}
			else
			{
				throw new XunitException("Test failed as content is not an ObjectResult.");
			}


		}



		public static readonly object[][] getImportLinesTestData =
			{
				new object[]{"header section",systemBodyPrompt,userPromptHeaderSection,200},
				new object[]{"header section with action",systemBodyPrompt,userPromptHeaderSectionWithAction,200},
				new object[]{"body section15",systemBodyPrompt,userPromptBodySection15,200},
				new object[]{"body section8",systemBodyPrompt,userPromptBodySection8,200},
				new object[]{"body section4",systemBodyPrompt,userPromptBodySection4,200},
				new object[]{"body section2",systemBodyPrompt,userPromptBodySection2,200},
				new object[]{"whole scene",systemBodyPrompt,userPromptWholeScene,200},
		};
		[Theory, MemberData(nameof(getImportLinesTestData))]
		public async Task GetImportLinesTest(string subTestName, string systemPrompt, string userPrompt, int expectedStatusCode)
		{
			var content = await _openAIControllerService.GetChatCompletionContent(systemPrompt, userPrompt, options =>
			{
				options.Temperature = 0.2f;
			});

			if (content is ObjectResult objectResult)
			{
				Assert.Equal(expectedStatusCode, objectResult.StatusCode);
				Assert.Equal(typeof(string), objectResult.Value.GetType());
				Assert.True(((string)objectResult.Value).Length > 0);

				try { JsonSerializer.Deserialize<object>((string)objectResult.Value); }
				catch (Exception ex) { throw new XunitException($"Test failed as content is not a RFC8259 compliant json string. {ex.Message}"); }

				try { JsonSerializer.Deserialize<List<ImportLine>>((string)objectResult.Value); }
				catch (Exception ex) { throw new XunitException($"Test failed as Json object returned could not be deserialised to ImportHeader. {ex.Message}"); }

			}
			else
			{
				throw new XunitException("Test failed as content is not an ObjectResult.");
			}


		}


	}
}