using System.ComponentModel.DataAnnotations;

namespace TheWhaddonShowReact.Models
{
	public class LoginLinkEmailData
	{
		public string Id { get; set; } = string.Empty;
		public string AppUrl { get; set; } = string.Empty;

		[EmailAddress]
		public string Email { get; set; } = string.Empty;

		public string FirstName { get; set; } = string.Empty;
	}
}
