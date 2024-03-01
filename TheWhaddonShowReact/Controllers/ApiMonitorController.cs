using Microsoft.AspNetCore.Mvc;
using MyApiMonitorClassLibrary.Interfaces;
using MyApiMonitorClassLibrary.Models;
using MyClassLibrary.ChartJs;
using MyClassLibrary.Tests.LocalServerMethods.Tests.DataAccess;
using TheWhaddonShowReact.Models.ApiTests;
using static TheWhaddonShowReact.Controllers.ApiMonitorController;
using Xunit.Sdk;
using MyExtensions;
using System.Drawing;
using MongoDB.Bson.IO;
using System.Text.Json;
using Microsoft.Net.Http.Headers;

namespace TheWhaddonShowReact.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
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

        public class ChartColors
        {
            public string Text = "rgba(0, 0, 0, 1)";
            public string TrafficGreen(double opacity = 1)
            {
                return $"rgba(38, 205, 95, {opacity.ToString()})";
            }
            public string TrafficOrange(double opacity = 1)
            {
                return $"rgba(235,184, 52, {opacity.ToString()})";
            }
            public string TrafficRed(double opacity = 1)
            {
                return $"rgba(255,85, 116, {opacity.ToString()})";
            }
            public string TrafficOrangeRed(double opacity = 1)
            {
                return $"rgba(255, 125, 71, {opacity.ToString()})";
            }

        }


        private ChartColors Colors = new ChartColors();



        private class DataRequest
        {
            public Guid TestOrCollectionId { get; set; } = Guid.Empty;
            public DateTime DateFrom { get; set; } = DateTime.UtcNow.AddDays(-7);
            public DateTime DateTo { get; set; } = DateTime.UtcNow;
            public int Skip { get; set; } = 0;
            public int Limit { get; set; } = 1000;

            public DataRequest(Guid? testOrCollectionId = null, DateTime? dateFrom = null, DateTime? dateTo = null, int skip = 0, int limit = 1000)
            {
                if (testOrCollectionId != null) { TestOrCollectionId = (Guid)testOrCollectionId; }
                if (dateFrom != null) { DateFrom = (DateTime)dateFrom; }
                if (dateTo != null) { DateTo = (DateTime)dateTo; }
                Skip = skip;
                Limit = limit;
            }
        }

        public class DataAndTotalRecords
        {
            public List<ApiTestData> Data = new List<ApiTestData>();
            public int TotalRecords = 0;

            public DataAndTotalRecords(List<ApiTestData> data, int totalRecords)
            {
                Data = data;
                TotalRecords = totalRecords;
            }
        }


        public List<TableData> ApiTestTableData { get; set; } = new List<TableData>();

        [HttpGet("tableData")]
        public async Task<IActionResult> Get([FromQuery] string? collectionType = "performance", DateTime? dateFrom = null, DateTime? dateTo = null, int skip = 0, int limit = 1000, Guid? testOrCollectionId = null)
        {
            DataRequest dataRequest = new DataRequest(testOrCollectionId, dateFrom, dateTo, skip, limit);

            DataAndTotalRecords dataAndTotalRecords = collectionType switch
            {
                "availability" => await GetAvailabilityData(dataRequest),
                "performance" => await GetPerformanceData(dataRequest),
                _ => new DataAndTotalRecords(new List<ApiTestData>(), 0)
            };

            ApiTestTableData = dataAndTotalRecords.Data
                            .OrderByDescending(x => x.TestDateTime)
                            .Select(x => new TableData(x.TestTitle
                , x.TestDateTime, x.WasSuccessful, x.TimeToComplete, x.FailureMessage, x.ExpectedResult, x.ActualResult)).ToList();

            var output = new { data = ApiTestTableData, totalRecords = dataAndTotalRecords.TotalRecords };
            var jsonOutput = JsonSerializer.Serialize(output);
            return Ok(output);
        }

        [HttpGet("chartData")]
        public async Task<IActionResult> Get([FromQuery] string chartType, Guid? testOrCollectionId = null, DateTime? dateFrom = null, DateTime? dateTo = null, int skip = 0, int limit = 1000)
        {
            DataRequest dataRequest = new DataRequest(testOrCollectionId, dateFrom, dateTo, skip, limit);
            DataAndTotalRecords dataAndTotalRecords;

            switch (chartType)
            {
                case "performance":
                    dataAndTotalRecords = await GetPerformanceData(dataRequest);
                    var performanceData = dataAndTotalRecords.Data;

                    string resultsChartConfig = await GetResultChartConfiguration(performanceData);
                    string speedChartConfig = await GetSpeedChartConfiguration(performanceData);
                    string resultAndSpeedChartConfig = await GetResultAndSpeedChartConfiguration(performanceData);

                    int reliability = (int)dataAndTotalRecords.Data.Select(x => x.WasSuccessful ? 100 : 0).Average();
                    int averageSpeed = (int)(dataAndTotalRecords.Data.Where(x => x.WasSuccessful == true && x.TimeToComplete != null).Select(x => x.TimeToComplete).Average() ?? 0);

                    var output = new { reliability, averageSpeed, resultsChartConfig, speedChartConfig, resultAndSpeedChartConfig };
                    string jsonOutput = JsonSerializer.Serialize(output);

                    return Ok(jsonOutput);

                  
                case "availability":
                    dataAndTotalRecords = await GetAvailabilityData(dataRequest);

                    var availabilityData = dataAndTotalRecords.Data;
                    string availabilityChartConfig = await GetAvailabilityChartConfiguration(availabilityData);
                    return Ok(availabilityChartConfig);
                    
                default:
                    return BadRequest("Invalid Chart Type");
                    
            };

        }


        private async Task<string> GetResultChartConfiguration(List<ApiTestData> performanceData)
        {
            List<ChartData_ResultByDateTime> resultByDateTime = await ResultByDateTime(performanceData);

            var builder = new ChartBuilder("bar");

            builder.AddLabels(resultByDateTime.Select(x => x.TestDateTime.ToString("o")).ToArray())
                   .ConfigureYAxis(options =>
                   {
                       options.Stacked("true")
                       .AddTitle("No of Tests", Colors.Text)
                       .AddAbsoluteScaleLimits(0, 50);
                   })
                   .ConfigureXAxis(options =>
                   {
                       options.AddTitle("DateTime", Colors.Text)
                       .Stacked("true")
                       .ConvertLabelToDateTime("MMM-DD")
                       .SetTickRotation(0);


                   })
                   .HideLegend()
                   .MaintainAspectRatio(false)
                   .AddClickEventHandler("onClick")
                   .AddDataset("Successes", options =>
                   {
                       options.AddValues(resultByDateTime.Select(x => x.SuccessfulTests).ToList())
                               .AddColors(new ColorSet(Colors.TrafficGreen(), Colors.TrafficGreen(0.6)))
                               .AddOrder(1)
                               .SpecifyAxes(null, "y")
                               .AddHoverFormat(new ColorSet(Colors.TrafficGreen(), Colors.TrafficGreen()));

                   })

                    .AddDataset("Failures", options =>
                    {
                        options.AddValues(resultByDateTime.Select(x => x.FailedTests).ToList())
                                .AddColors(new ColorSet(Colors.TrafficRed(), Colors.TrafficRed(0.6)))
                                .AddOrder(2)
                                .SpecifyAxes(null, "y")
                                .AddHoverFormat(new ColorSet(Colors.TrafficRed(), Colors.TrafficRed()));
                    });

            string output = builder.BuildJson();
            return output;
        }

        private async Task<string> GetAvailabilityChartConfiguration(List<ApiTestData> availabilityData)
        {
            List<ChartData_SpeedsByDateTime> availabilityByDateTime = await GetAvailabilityByDateTime(availabilityData);
            var builder = new ChartBuilder("scatter");
            builder.AddDefaultPointStyle(options =>
            {
                options.AddStyleAndRadius("circle", 0);
            })
            .AddDefaultLineStyle(options =>
            {
                options.AddLineStyle(3, null)
                .AddColors(new ColorSet(Colors.TrafficGreen(), Colors.TrafficGreen(0.5)));
            })
            .ConfigureYAxis(options =>
            {
                options.AddTitle("Time to Complete (ms)", Colors.Text)
                .AddAbsoluteScaleLimits(100, 500);
            })
            .ConfigureXAxis(options =>
            {
                options.AddTitle("Time", Colors.Text)
                .ConvertTickToDateTime("HH:mm:ss")
                .AddAbsoluteScaleLimits(availabilityByDateTime.Select(x => x.TestDateTime).Min().ToJavascriptTimeStamp()
                                        , availabilityByDateTime.Select(x => x.TestDateTime).Max().ToJavascriptTimeStamp());

            })
            .HideLegend()
            .MaintainAspectRatio(false)
            .AddDataset("Availability", options =>
            {
                options.AddCoordinates(availabilityByDateTime.Select(x => new Coordinate(x.TestDateTime, (double)x.AvgSpeed!)).ToList())
                .ShowLine()
                ;

            });

            string output = builder.BuildJson();
            return output;
        }

        private async Task<string> GetSpeedChartConfiguration(List<ApiTestData> performanceData)
        {

            List<ChartData_SpeedsByDateTime> SpeedByDateTime = await SpeedsByDateTime(performanceData);

            var builder = new ChartBuilder("line");
            builder.AddLabels(SpeedByDateTime.Select(x => x.TestDateTime.ToString("o")).ToArray())

                   .AddDefaultPointStyle(options =>
                   {
                       options.AddStyleAndRadius("circle", 0)
                       .AddColors(new ColorSet(Colors.TrafficGreen(), Colors.TrafficGreen()))
                       .AddHover(6, 6)
                       .AddHit(15);
                   })
                   .AddClickEventHandler("onClick")
                   .ConfigureXAxis(options =>
                   {
                       options.AddTitle("DateTime", Colors.Text)
                       .ConvertLabelToDateTime("MMM-DD")
                       .SetTickRotation(0)
                       .AutoSkipTicks(true, 5);
                   })
                   .ConfigureYAxis(options =>
                   {
                       options.AddTitle("Time To Complete (ms)", Colors.Text);
                   })
                   .HideLegend()
                   .MaintainAspectRatio(false)
                   .AddDataset("Min Time To Complete", options =>
                   {
                       options.AddValues(SpeedByDateTime.Select(x => x.MinSpeed).ToList())
                               .AddArea("+1", 1)
                               .AddColors(new ColorSet(Colors.TrafficGreen(), Colors.TrafficGreen(0.5)))
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
                               .AddColors(new ColorSet(Colors.TrafficGreen(), Colors.TrafficGreen(0.5)))
                               .AddOrder(3)
                                .SpecifyAxes(null, "y");
                   });


            string output = builder.BuildJson();

            return output;
        }

        private async Task<string> GetResultAndSpeedChartConfiguration(List<ApiTestData> performanceData)
        {

            Dictionary<string, List<CategoryCoordinate>> chartSeries = new Dictionary<string, List<CategoryCoordinate>>();

            List<ChartData_ResultAndSpeedByTest> resultAndSpeedByTest = await ResultAndSpeedByDateTime(performanceData);

            chartSeries.Add("Always Successfull"
                            , resultAndSpeedByTest.Where(x => x.AverageResult == 100 && x.LatestResult == true).Select(x => new CategoryCoordinate(x.Controller, x.Test, x.AverageTimeToComplete, $"{x.Controller}-{x.Test}", x.TestId.ToString())).ToList());
            chartSeries.Add("Latest Successfull"
                            , resultAndSpeedByTest.Where(x => x.AverageResult != 100 && x.LatestResult == true).Select(x => new CategoryCoordinate(x.Controller, x.Test, x.AverageTimeToComplete, $"{x.Controller}-{x.Test}", x.TestId.ToString())).ToList());
            chartSeries.Add("Currently Failing"
                            , resultAndSpeedByTest.Where(x => x.LatestResult == false).Select(x => new CategoryCoordinate(x.Controller, x.Test, x.AverageTimeToComplete, $"{x.Controller}-{x.Test}", x.TestId.ToString())).ToList());

            var bubbleData = new CategoryBubbleChartData(chartSeries, 30);

            var builder = new ChartBuilder("bubble");

            builder.AddDataset("Always Successful", options =>
            {
                options.AddCoordinates(bubbleData.Coordinates["Always Successfull"]!)
                .AddColors(new ColorSet(Colors.TrafficGreen(), Colors.TrafficGreen(0.5)));
            })
                .AddDataset("Latest Successful", options =>
                {
                    options.AddCoordinates(bubbleData.Coordinates["Latest Successfull"])
                    .AddColors(new ColorSet(Colors.TrafficOrange(), Colors.TrafficOrange(0.5)));
                })
                .AddDataset("Currently Failing", options =>
                {
                    options.AddCoordinates(bubbleData.Coordinates["Currently Failing"])
                    .AddColors(new ColorSet(Colors.TrafficRed(), Colors.TrafficRed(0.5)));
                })
                .ConfigureYAxis(options =>
                {
                    options.AddTitle("Test", Colors.Text)
                    .AddAbsoluteScaleLimits(0, bubbleData.YLabels.Count + 1)
                    .OverrideTickValues(bubbleData.YLabels.Values.Select(x => (double)x).ToList())
                    .AddTickCategoryLabels(bubbleData.YLabels)
                    .TickColor(Colors.Text);
                })
                .ConfigureXAxis(options =>
                {
                    options.AddTitle("Controller", Colors.Text)
                    .AddAbsoluteScaleLimits(0, bubbleData.XLabels.Count + 1)
                    .AddTickCategoryLabels(bubbleData.XLabels)
                    .AutoSkipTicks(false)
                    .SetTickRotation(90)
                    .TickColor(Colors.Text);
                })
                //.HideLegend()
                .MaintainAspectRatio(false)
                .AddClickEventHandler("onClick");

            string output = builder.BuildJson();
            return output;
        }




        private async Task<DataAndTotalRecords> GetAvailabilityData(DataRequest dataRequest)
        {
            Guid testOrCollectionId = dataRequest.TestOrCollectionId == Guid.Empty ? AvailabilityCollectionId : dataRequest.TestOrCollectionId;
            var draftOutput = await _dataAccess.GetAllByCollectionId(testOrCollectionId,
                dataRequest.DateFrom,
                dataRequest.DateTo,
                dataRequest.Skip,
                dataRequest.Limit
                );
            if (draftOutput.total == 0)
            { //if it can't find any using the guid passed in as collection Id then try using it as test Id.
                draftOutput = await _dataAccess.GetAllByTestId(testOrCollectionId, dataRequest.DateFrom, dataRequest.DateTo, dataRequest.Skip, dataRequest.Limit);
            }

            DataAndTotalRecords output = new DataAndTotalRecords(draftOutput.records, draftOutput.total);
            return output;
        }
        private async Task<DataAndTotalRecords> GetPerformanceData(DataRequest dataRequest)
        {
            Guid testOrCollectionId = dataRequest.TestOrCollectionId == Guid.Empty ? PerformanceCollectionId : dataRequest.TestOrCollectionId;
            var draftOutput = await _dataAccess.GetAllByCollectionId(testOrCollectionId,
                dataRequest.DateFrom,
                dataRequest.DateTo,
            dataRequest.Skip,
                dataRequest.Limit
                );

            if (draftOutput.total == 0)
            { //if it can't find any using the guid passed in as collection Id then try using it as test Id.
                draftOutput = await _dataAccess.GetAllByTestId(testOrCollectionId, dataRequest.DateFrom, dataRequest.DateTo, dataRequest.Skip, dataRequest.Limit);
            }

            DataAndTotalRecords output = new DataAndTotalRecords(draftOutput.records, draftOutput.total);
            return output;
        }
        private async Task<List<ChartData_ResultByDateTime>> ResultByDateTime(List<ApiTestData> performanceData)
        {
            List<ChartData_ResultByDateTime> output = _dataProcessor.ResultByDateTime(performanceData);
            return output;
        }
        private async Task<List<ChartData_SpeedsByDateTime>> SpeedsByDateTime(List<ApiTestData> performanceData)
        { 
            List<ChartData_SpeedsByDateTime> output = _dataProcessor.SpeedsByDateTime(performanceData);
            return output;
        }
        private async Task<List<ChartData_ResultAndSpeedByTest>> ResultAndSpeedByDateTime(List<ApiTestData> performanceData)
        { 
            List<ChartData_ResultAndSpeedByTest> output = _dataProcessor.ResultAndSpeedByTest(performanceData);
            return output;
        }
        private async Task<List<ChartData_SpeedsByDateTime>> GetAvailabilityByDateTime(List<ApiTestData> availabilityData)
        {
            List<ChartData_SpeedsByDateTime> output = _dataProcessor.AvailabilityByDateTime(availabilityData);
            return output;
        }


    }
}
