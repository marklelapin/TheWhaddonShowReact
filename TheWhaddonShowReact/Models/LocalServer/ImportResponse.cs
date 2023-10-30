using TheWhaddonShowClassLibrary.Models;

namespace TheWhaddonShowReact.Models.LocalServer
{
	public class ImportResponse
	{
		public List<PartUpdate> PartUpdates { get; set; } = new List<PartUpdate>();

		public List<ScriptItemUpdate> ScriptItemUpdates { get; set; } = new List<ScriptItemUpdate>();


		public ImportResponse(List<PartUpdate> partUpdates, List<ScriptItemUpdate> scriptItemUpdates)
		{
			PartUpdates = partUpdates;
			ScriptItemUpdates = scriptItemUpdates;
		}
	}
}
