using Microsoft.AspNetCore.Mvc;
using MimeKit;
using MyClassLibrary.Interfaces;
using TheWhaddonShowReact.Models;

namespace TheWhaddonShowReact.Controllers
{
	[Route("api/[controller]")]
	[ApiController]

	public class EmailController : ControllerBase
	{
		private IEmailClient _emailClient;
		private IConfiguration _config;

		public EmailController(IEmailClient emailClient, IConfiguration config) // TODO should be taking in IFileControllerService
		{
			_emailClient = emailClient;
			_config = config;
		}


		[HttpPost("loginlink")]
		public async Task<IActionResult> LoginLink([FromBody] LoginLinkEmailData data)
		{
			string from = _config["Email:FromAddress"] ?? "";
			string loginLink = @$"{data.AppUrl}/loginlink?id={data.Id}";
			string to = data.Email;
			string subject = "The Whaddon Show App Initial Login Link";
			string htmlBody = $"<p>Hi {data.FirstName}!<p/><p>Please click the link below to login to the Whaddon Show App.</p><br/><a href=\"{loginLink}\">{loginLink}</a><br/><br/><p>Thanks,</p><p>Mark!</p>";

			MimeMessage message = new MimeMessage();
			message.From.Add(address: new MailboxAddress("The Whaddon Show App", from));
			message.To.Add(address: new MailboxAddress(to, to));
			message.Subject = subject;
			message.Body = new TextPart("html") { Text = htmlBody };

			var response = await _emailClient.SendAsync(message);

			if (response == true) { return Ok(); }
			else return StatusCode(500, "Error sending email from controller.");

		}


	}
}
