using Microsoft.AspNetCore.Mvc;
using MyApiMonitorClassLibrary.Interfaces;
using MyApiMonitorClassLibrary.Models;
using System.Text.Json;

namespace TheWhaddonShowReact.Controllers
{
	[ApiController]
	[Route("[controller]")]
	public class ApiMonitorController : Controller
	{
		private readonly IApiTestDataAccess _dataAccess;
		public ApiMonitorController(IApiTestDataAccess dataAccess)
		{
			_dataAccess = dataAccess;
		}

		//private Guid AvailabilityCollectionId c8ecdb94-36a9-4dbb-a5db-e6e036bbba0f

		//performance	05b0adac-6ee4-4390-a83b-092ca92b040d

		public List<ApiTestData> TestResults { get; set; } = new List<ApiTestData>();

		public async Task<IActionResult> OnGet(Guid? testOrCollectionId = null, DateTime? dateFrom = null, DateTime? dateTo = null, int skip = 0, int limit = 1000)
		{
			testOrCollectionId = testOrCollectionId ?? Guid.Parse("05b0adac-6ee4-4390-a83b-092ca92b040d");
			dateFrom = dateFrom ?? DateTime.UtcNow.AddDays(-1);
			dateTo = dateTo ?? DateTime.UtcNow;

			(TestResults, int totalRecords) = await _dataAccess.GetAllByCollectionId((Guid)testOrCollectionId, dateFrom, dateTo, skip, limit);

			if (totalRecords == 0)
			{ //if it can't find any using the guid passed in as collection Id then try using it as test Id.

				(TestResults, totalRecords) = await _dataAccess.GetAllByTestId((Guid)testOrCollectionId, dateFrom, dateTo, skip, limit);

			}

			TestResults = TestResults.OrderByDescending(x => x.TestDateTime).ToList();

			return Content(JsonSerializer.Serialize(TestResults));

		}

	}
}
