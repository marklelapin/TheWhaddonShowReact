namespace TheWhaddonShowReact.Models.ApiTests
{
	public class TableData
	{
		public Guid Key { get; set; }

		public string Title { get; set; }

		public DateTime DateTime { get; set; }

		public bool Success { get; set; }

		public string? FailureMessage { get; set; }

		public TimeToComplete TimeToComplete { get; set; }

		public Results Results { get; set; } = new Results(null, null);

		public TableData(string title, DateTime dateTime, bool success, int? timeToComplete, string? failureMessage, string? expectedResult, string? actualresult)
		{
			Key = Guid.NewGuid();
			Title = title;
			DateTime = dateTime;
			Success = success;
			TimeToComplete = new TimeToComplete(timeToComplete);
			if (success == false)
			{
				FailureMessage = failureMessage;
				Results = new Results(expectedResult, actualresult);
			}

		}

	}
}
