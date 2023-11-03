using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MyClassLibrary.Interfaces;
using MyClassLibrary.OpenAI;
using System.Reflection;

namespace TheWhaddonShowReactUnitTesting
{
	public class Startup
	{
		public Startup()
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

			//_openAIControllerService = serviceProvider.GetRequiredService<IOpenAIControllerService>();
		}
	}
}
