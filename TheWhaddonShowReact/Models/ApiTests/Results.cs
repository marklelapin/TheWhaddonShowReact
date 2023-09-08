namespace TheWhaddonShowReact.Models.ApiTests
{
	public class Results
	{
		public string? Expected { get; set; }

		public string? Actual { get; set; }

		public Results(string? expected, string? actual)
		{
			Expected = expected;
			Actual = actual;
		}
	}
}
