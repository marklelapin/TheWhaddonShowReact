using Microsoft.AspNetCore.Mvc;
using MyApiMonitorClassLibrary.Interfaces;
using MyApiMonitorClassLibrary.Models;
using MyClassLibrary.ChartJs;
using MyClassLibrary.Tests.LocalServerMethods.Tests.DataAccess;
using TheWhaddonShowReact.Models.ApiTests;

namespace TheWhaddonShowReact.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ApiMonitorController : ControllerBase
    {
        private readonly IApiTestDataAccess _dataAccess;
        private readonly IChartDataProcessor _dataProcessor;

        public ApiMonitorController(IApiTestDataAccess dataAccess, IChartDataProcessor dataProcessor)
        {
            _dataAccess = dataAccess;
            _dataProcessor = dataProcessor;
        }

        private Guid AvailabilityCollectionId = Guid.Parse("c8ecdb94-36a9-4dbb-a5db-e6e036bbba0f");
        private Guid PerformanceCollectionId = Guid.Parse("05b0adac-6ee4-4390-a83b-092ca92b040d");
        private DateTime DefaultDateFrom = DateTime.UtcNow.AddDays(-7);
        private DateTime DefaultDateTo = DateTime.UtcNow;

        private async Task<(List<ApiTestData> records, int totalRecords)> AvailabilityData(Guid testOrCollectionId, DateTime dateFrom, DateTime dateTo, int skip = 0, int limit = 1000)
        {
            var output = await _dataAccess.GetAllByCollectionId(testOrCollectionId, dateFrom, dateTo, skip, limit);
            return output;
        }

        private async Task<(List<ApiTestData> records, int totalRecords)> PerformanceData(Guid testOrCollectinId, DateTime dateFrom, DateTime dateTo, int skip = 0, int limit = 1000)
        {
            var output = await _dataAccess.GetAllByCollectionId(testOrCollectinId, dateFrom, dateTo, skip, limit);
            return output;
        }

        public List<TableData> ApiTestTableData { get; set; } = new List<TableData>();

        [HttpGet("tableData")]
        public async Task<IActionResult> Get([FromQuery] string type, DateTime? dateFrom = null, DateTime? dateTo = null, int skip = 0, int limit = 1000, Guid? testOrCollectionId = null)
        {
            dateFrom = dateFrom ?? DefaultDateFrom;
            dateTo = dateTo ?? DefaultDateTo;
            Guid testCollectionId = testOrCollectionId ?? type switch
            {
                "Availability" => AvailabilityCollectionId,
                "Performance" => PerformanceCollectionId,
                _ => Guid.Empty
            };

            (List<ApiTestData> draftData, int totalRecords) = await _dataAccess.GetAllByCollectionId(testCollectionId, dateFrom, dateTo, skip, limit);

            if (totalRecords == 0)
            { //if it can't find any using the guid passed in as collection Id then try using it as test Id.

                (draftData, totalRecords) = await _dataAccess.GetAllByTestId(testCollectionId, dateFrom, dateTo, skip, limit);

            }

            ApiTestTableData = draftData
                            .OrderByDescending(x => x.TestDateTime)
                            .Select(x => new TableData(x.TestTitle
                , x.TestDateTime, x.WasSuccessful, x.TimeToComplete, x.FailureMessage, x.ExpectedResult, x.ActualResult)).ToList();

            return Ok(ApiTestTableData.ToArray());

        }

        [HttpGet("chartData")]
        public async Task<IActionResult> Get([FromQuery] Guid? testOrCollectionId = null, DateTime? dateFrom = null, DateTime? dateTo = null, int skip = 0, int limit = 1000)
        {
            testOrCollectionId = testOrCollectionId ?? Guid.Parse("05b0adac-6ee4-4390-a83b-092ca92b040d");
            dateFrom = dateFrom ?? DateTime.UtcNow.AddDays(-1);
            dateTo = dateTo ?? DateTime.UtcNow;


            return Ok(ApiTestTableData.ToArray());

        }


        private void ConfigureResultChart()
        {
            var builder = new ChartBuilder("bar");

            builder.AddLabels(ResultByDateTime.Select(x => x.TestDateTime.ToString("o")).ToArray())
                   .ConfigureYAxis(options =>
                   {
                       options.Stacked("true")
                       .AddTitle("No of Tests", chartWhite)
                       .AddAbsoluteScaleLimits(0, 50);
                   })
                   .ConfigureXAxis(options =>
                   {
                       options.AddTitle("DateTime", chartWhite)
                       .Stacked("true")
                       .ConvertLabelToDateTime("MMM-DD")
                       .SetTickRotation(0);


                   })
                   .HideLegend()
                   .MaintainAspectRatio(false)
                   .AddClickEventHandler("resultChartClickHandler")
                   .AddDataset("Successes", options =>
                   {
                       options.AddValues(ResultByDateTime.Select(x => x.SuccessfulTests).ToList())
                               .AddColors(new ColorSet(MyColors.TrafficGreen(), MyColors.TrafficGreen(0.6)))
                               .AddOrder(1)
                               .SpecifyAxes(null, "y")
                               .AddHoverFormat(new ColorSet(MyColors.TrafficGreen(), MyColors.TrafficGreen()));

                   })

                    .AddDataset("Failures", options =>
                    {
                        options.AddValues(ResultByDateTime.Select(x => x.FailedTests).ToList())
                                .AddColors(new ColorSet(MyColors.TrafficOrangeRed(), MyColors.TrafficOrangeRed(0.6)))
                                .AddOrder(2)
                                .SpecifyAxes(null, "y")
                                .AddHoverFormat(new ColorSet(MyColors.TrafficOrangeRed(), MyColors.TrafficOrangeRed()));
                    });

            ResultChartConfiguration = builder.BuildJson();
        }

        private void ConfigureAvailabilityChart()
        {
            var builder = new ChartBuilder("scatter");
            builder.AddDefaultPointStyle(options =>
            {
                options.AddStyleAndRadius("circle", 0);
            })
            .AddDefaultLineStyle(options =>
            {
                options.AddLineStyle(3, null)
                .AddColors(new ColorSet(MyColors.TrafficGreen(), MyColors.TrafficGreen(0.5)));
            })
            .ConfigureYAxis(options =>
            {
                options.AddTitle("Time to Complete (ms)", chartWhite)
                .AddAbsoluteScaleLimits(100, 500);
            })
            .ConfigureXAxis(options =>
            {
                options.AddTitle("Time", chartWhite)
                .ConvertTickToDateTime("HH:mm:ss")
                .AddAbsoluteScaleLimits(AvailabilityByDateTime.Select(x => x.TestDateTime).Min().ToJavascriptTimeStamp()
                                        , AvailabilityByDateTime.Select(x => x.TestDateTime).Max().ToJavascriptTimeStamp());

            })
            .HideLegend()
            .MaintainAspectRatio(false)
            .AddDataset("Availability", options =>
            {
                options.AddCoordinates(AvailabilityByDateTime.Select(x => new Coordinate(x.TestDateTime, (double)x.AvgSpeed!)).ToList())
                .ShowLine()
                ;

            });

            AvailabilityChartConfiguration = builder.BuildJson();
        }

        private void ConfigureSpeedChart()
        {
            var builder = new ChartBuilder("line");
            builder.AddLabels(SpeedByDateTime.Select(x => x.TestDateTime.ToString("o")).ToArray())

                   .AddDefaultPointStyle(options =>
                   {
                       options.AddStyleAndRadius("circle", 0)
                       .AddColors(new ColorSet(MyColors.TrafficGreen(), MyColors.TrafficGreen()))
                       .AddHover(6, 6)
                       .AddHit(15);
                   })
                   .AddClickEventHandler("speedChartClickHandler")
                   .ConfigureXAxis(options =>
                   {
                       options.AddTitle("DateTime", chartWhite)
                       .ConvertLabelToDateTime("MMM-DD")
                       .SetTickRotation(0)
                       .AutoSkipTicks(true, 5);
                   })
                   .ConfigureYAxis(options =>
                   {
                       options.AddTitle("Time To Complete (ms)", MyColors.OffWhite());
                   })
                   .HideLegend()
                   .MaintainAspectRatio(false)
                   .AddDataset("Min Time To Complete", options =>
                   {
                       options.AddValues(SpeedByDateTime.Select(x => x.MinSpeed).ToList())
                               .AddArea("+1", 1)
                               .AddColors(new ColorSet(MyColors.TrafficGreen(), MyColors.TrafficGreen(0.5)))
                               .AddOrder(1)
                               .SpecifyAxes(null, "y");
                   })
                   .AddDataset("Avg Time To Complete", options =>
                   {
                       options.AddValues(SpeedByDateTime.Select(x => x.AvgSpeed).ToList())
                               .AddLine(3)
                               .AddColors(new ColorSet(Color.Black, Color.Transparent))
                               .AddOrder(2)
                               .SpecifyAxes("x", "y");

                   })
                   .AddDataset("Max Time To Complete", options =>
                   {
                       options.AddValues(SpeedByDateTime.Select(x => x.MaxSpeed).ToList())
                               .AddArea("-1", 1)
                               .AddColors(new ColorSet(MyColors.TrafficGreen(), MyColors.TrafficGreen(0.5)))
                               .AddOrder(3)
                                .SpecifyAxes(null, "y");
                   });


            SpeedChartConfiguration = builder.BuildJson();
        }

        private void ConfigureResultAndSpeedChart()
        {
            Dictionary<string, List<CategoryCoordinate>> chartSeries = new Dictionary<string, List<CategoryCoordinate>>();

            chartSeries.Add("Always Successfull"
                            , ResultAndSpeedByTest.Where(x => x.AverageResult == 100 && x.LatestResult == true).Select(x => new CategoryCoordinate(x.Controller, x.Test, x.AverageTimeToComplete, $"{x.Controller}-{x.Test}", x.TestId.ToString())).ToList());
            chartSeries.Add("Latest Successfull"
                            , ResultAndSpeedByTest.Where(x => x.AverageResult != 100 && x.LatestResult == true).Select(x => new CategoryCoordinate(x.Controller, x.Test, x.AverageTimeToComplete, $"{x.Controller}-{x.Test}", x.TestId.ToString())).ToList());
            chartSeries.Add("Currently Failing"
                            , ResultAndSpeedByTest.Where(x => x.LatestResult == false).Select(x => new CategoryCoordinate(x.Controller, x.Test, x.AverageTimeToComplete, $"{x.Controller}-{x.Test}", x.TestId.ToString())).ToList());


            var bubbleData = new CategoryBubbleChartData(chartSeries, 30);


            var builder = new ChartBuilder("bubble");

            builder.AddDataset("Always Successful", options =>
            {
                options.AddCoordinates(bubbleData.Coordinates["Always Successfull"]!)
                .AddColors(new ColorSet(MyColors.TrafficGreen(), MyColors.TrafficGreen(0.5)));
            })
                .AddDataset("Latest Successful", options =>
                {
                    options.AddCoordinates(bubbleData.Coordinates["Latest Successfull"])
                    .AddColors(new ColorSet(MyColors.TrafficOrange(), MyColors.TrafficOrange(0.5)));
                })
                .AddDataset("Currently Failing", options =>
                {
                    options.AddCoordinates(bubbleData.Coordinates["Currently Failing"])
                    .AddColors(new ColorSet(MyColors.TrafficRed(), MyColors.TrafficRed(0.5)));
                })
                .ConfigureYAxis(options =>
                {
                    options.AddTitle("Test", MyColors.OffWhite())
                    .AddAbsoluteScaleLimits(0, bubbleData.YLabels.Count + 1)
                    .OverrideTickValues(bubbleData.YLabels.Values.Select(x => (double)x).ToList())
                    .AddTickCategoryLabels(bubbleData.YLabels)
                    .TickColor(Color.Gainsboro);
                })
                .ConfigureXAxis(options =>
                {
                    options.AddTitle("Controller", MyColors.OffWhite())
                    .AddAbsoluteScaleLimits(0, bubbleData.XLabels.Count + 1)
                    .AddTickCategoryLabels(bubbleData.XLabels)
                    .AutoSkipTicks(false)
                    .SetTickRotation(90)
                    .TickColor(Color.Gainsboro);
                })
                //.HideLegend()
                .MaintainAspectRatio(false)
                .AddClickEventHandler("resultAndSpeedChartClickHandler");



            ResultAndSpeedChartConfiguration = builder.BuildJson();

        }

    }
}
