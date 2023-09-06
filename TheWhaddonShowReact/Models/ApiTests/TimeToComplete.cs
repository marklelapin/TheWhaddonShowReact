namespace TheWhaddonShowReact.Models.ApiTests
{
	public class TimeToComplete
	{
		public int Speed { get; set; }
		public string Progress { get; set; }
		public string Type { get; set; }

		private int greenSpeed = 200;

		private int amberSpeed = 400;

		private int maxSpeedOnTable = 500;

		public TimeToComplete(int? speed)
		{
			Speed = speed ?? 0;
			Progress = Math.Min(Speed * 100 / maxSpeedOnTable, 100).ToString("0");

			if (speed > amberSpeed) { Type = "danger"; }
			else if (speed > greenSpeed) { Type = "warning"; }
			else { Type = "success"; }
		}

	}
}
