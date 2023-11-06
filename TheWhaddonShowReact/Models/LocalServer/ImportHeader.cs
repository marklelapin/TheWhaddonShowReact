namespace TheWhaddonShowReact.Models.LocalServer
{
	public class ImportHeader
	{
		public string title { get; set; } = "";

		public string synopsis { get; set; } = "";

		public string initialStaging { get; set; } = "";


		public List<string> parts { get; set; } = new List<string>();

		//public string InitialCurtain { get; set; } = "";

		public ImportHeader() { }


	}
}
