using System.Text.Json;
using System.Text.Json.Serialization;

namespace TheWhaddonShowReact.Models
{
	public class SyncJsonOptions
	{

		// Create JsonSerializerOptions with CamelCaseNamingPolicy
		public JsonSerializerOptions JsonOptions
		{
			get
			{
				var options = new JsonSerializerOptions()
				{
					PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
					WriteIndented = true // Optional: for pretty-printing
				};

				options.Converters.Add(new DateTimeConverter());

				return options;
			}
		}




	}
	internal class DateTimeConverter : JsonConverter<DateTime>
	{
		public override DateTime Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
		{
			// Implement if needed
			throw new NotImplementedException();
		}

		public override void Write(Utf8JsonWriter writer, DateTime value, JsonSerializerOptions options)
		{
			// Format the DateTime to include milliseconds
			writer.WriteStringValue(value.ToString("yyyy-MM-ddTHH:mm:ss.fff"));
		}
	}

}
