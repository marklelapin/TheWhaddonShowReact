using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using MyClassLibrary.DataAccessMethods;
using System.Data;
using System.Net;
using System.Text.Json;
using static TheWhaddonShowReact.Controllers.SettingsController;

namespace TheWhaddonShowReact.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SettingsController : ControllerBase
    {
        private readonly ISqlDataAccess _sqlDataAccess;
        private readonly string connectionStringName = "ServerSQL";

        public SettingsController(ISqlDataAccess sqlDataAccess)
        {
            _sqlDataAccess = sqlDataAccess;
        }

        public class Show
        {
            public Guid id { get; set; }
            public bool isCurrent { get; set; }
            public string title { get; set; } = "";
            public DateTime? openingNight { get; set; } = null;
            public DateTime? lastNight { get; set; } = null;

            public bool isActive = false;

            public string type = "Show";
            public Guid? nextId { get; set; } = null;
            public Guid? previousId { get; set; } = null;

            public Guid? parentId { get; set; } = null;

        }

        public class CowboyShoutOut
        {
            public bool showDaysTillOpeningNight { get; set; }
            public bool showCastingStatistics { get; set; }
            public DateTime? nextRehearsalDate { get; set; } = null;
            public string? additionalMessage  { get; set; } = null;
        }

        public class Settings
        {
            public CowboyShoutOut cowboyShoutOut { get; set; }
            public List<Show> shows { get; set; }
            
            public Settings(List<Show> _shows, CowboyShoutOut _cowboyShoutOut)
            {
                shows = _shows;
                cowboyShoutOut = _cowboyShoutOut;
            }

        }

        [HttpGet("all")]
        public async Task<IActionResult> GetSettings()
        {
            try
            {
                var showParameters = new DynamicParameters();
                showParameters.Add("@Output", null, DbType.String, ParameterDirection.Output,-1); 
                await _sqlDataAccess.ExecuteStoredProcedure("spGetShows", showParameters, connectionStringName);
                var showsJson = showParameters.Get<string>("@Output");


                List<Show> shows = JsonSerializer.Deserialize<List<Show>>(showsJson) ?? new List<Show>();

                var cowboyParameters = new DynamicParameters();
                cowboyParameters.Add("@Output", null, DbType.String, ParameterDirection.Output,-1);
                await _sqlDataAccess.ExecuteStoredProcedure("spGetCowboyShoutOut", cowboyParameters, connectionStringName);
                var cowboyJson = cowboyParameters.Get<string>("@Output");

                CowboyShoutOut cowboyShoutOut;
                if (cowboyJson != null)
                {
                    cowboyShoutOut = JsonSerializer.Deserialize<CowboyShoutOut>(cowboyJson);
                }
                else
                {
                    cowboyShoutOut = new CowboyShoutOut();
                }

                var settings = new Settings(shows, cowboyShoutOut);
                
                var jsonOutput = JsonSerializer.Serialize(settings);
                return Ok(settings);  
                
            }
            catch (Exception ex)
            {
                return new ObjectResult(ex.Message) { StatusCode = (int)HttpStatusCode.InternalServerError };
            }
        }

       

        [HttpPost("cowboyShoutOut")]
        public async Task<IActionResult> PostCowboyShoutOut([FromBody] CowboyShoutOut cowboyShoutOut)
        {

            try
            {
                var parameters = new DynamicParameters();
                parameters.Add("@ShowDaysTillOpeningNight", cowboyShoutOut.showDaysTillOpeningNight, DbType.Boolean, ParameterDirection.Input);
                parameters.Add("@ShowCastingStatistics", cowboyShoutOut.showCastingStatistics, DbType.Boolean, ParameterDirection.Input);
                parameters.Add("@NextRehearsalDate", cowboyShoutOut.nextRehearsalDate, DbType.DateTime, ParameterDirection.Input);
                parameters.Add("@AdditionalMessage", cowboyShoutOut.additionalMessage, DbType.String, ParameterDirection.Input,250);

                await _sqlDataAccess.ExecuteStoredProcedure("spUpdateCowboyShoutOut", parameters, connectionStringName);

                return Ok();
            }
            catch (Exception ex)
            {
                return new ObjectResult(ex.Message) { StatusCode = (int)HttpStatusCode.InternalServerError };
            }

        }

        [HttpPost("shows")]
        public async Task<IActionResult> PostShows([FromBody] List<Show> shows)
        {
          var showsToComplete = shows.Count();
            try
             {
                foreach (var show in shows)
                {

                    var parameters = new DynamicParameters();
                    parameters.Add("@ShowId", show.id, DbType.Guid, ParameterDirection.Input);
                    parameters.Add("@Title", show.title, DbType.String, ParameterDirection.Input,250);
                    parameters.Add("@OpeningNight", show.openingNight, DbType.DateTime, ParameterDirection.Input);
                    parameters.Add("@LastNight", show.lastNight, DbType.DateTime, ParameterDirection.Input);
                    parameters.Add("@IsCurrent", show.isCurrent, DbType.Boolean, ParameterDirection.Input);
                    parameters.Add("@Completed", false, DbType.Boolean, ParameterDirection.Output);
                    _sqlDataAccess.ExecuteStoredProcedure("spUpdateShow", parameters, connectionStringName).GetAwaiter().GetResult();

                    var completed = parameters.Get<bool>("@Completed");
                    if (completed) showsToComplete = showsToComplete - 1; 
                }
                if (showsToComplete == 0)
                {
                    return Ok();
                }
                throw new Exception("Failed to complete update of all shows");
            }
            catch (Exception ex)
            {
                return new ObjectResult(ex.Message) { StatusCode = (int)HttpStatusCode.InternalServerError };
            }

           

        }


        [HttpPost("createNewShow")]
        public async Task<IActionResult> CreateNewShow()
        {
            try
            {
              var parameters = new DynamicParameters();
              parameters.Add("@NewShowId", null, DbType.Guid, ParameterDirection.Output);
              
                _sqlDataAccess.ExecuteStoredProcedure("spCreateNewShow", parameters, connectionStringName).GetAwaiter().GetResult();

              var newShowId = parameters.Get<Guid>("@NewShowId");
               
              return await GetSettings();
              
            }
            catch (Exception ex)
            {
                return new ObjectResult(ex.Message) { StatusCode = (int)HttpStatusCode.InternalServerError };
            }

        }



        [HttpPost("showSnapshot")]
        public async Task<IActionResult> CreateNewShow([FromQuery] Guid showId,string description )
        {
            try
            {
                var parameters = new DynamicParameters();
                parameters.Add("@ShowId", showId, DbType.Guid, ParameterDirection.Input);
                parameters.Add("@Description", description, DbType.String, ParameterDirection.Input, 250);
                _sqlDataAccess.ExecuteStoredProcedure("spTakeShowSnapshot", parameters, connectionStringName).GetAwaiter().GetResult();

                return Ok();
            }
            catch (Exception ex)
            {
                return new ObjectResult(ex.Message) { StatusCode = (int)HttpStatusCode.InternalServerError };
            }

        }
    }

}

   
