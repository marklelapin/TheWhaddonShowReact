using TheWhaddonShowClassLibrary.Models;

namespace TheWhaddonShowReact.Models.LocalServer
{
	public class ImportResponse
	{


		public List<PartUpdate> PartUpdates { get; set; } = new List<PartUpdate>();

		public List<ScriptItemUpdate> ScriptItemUpdates { get; set; } = new List<ScriptItemUpdate>();


		public ImportResponse() { }


		public ImportResponse(List<ScriptItemUpdate> scriptItemUpdates, List<PartUpdate>? partUpdates = null)
		{

			ScriptItemUpdates = scriptItemUpdates;
			if (partUpdates != null)
			{
				PartUpdates = partUpdates;
			}

		}
	}
}
