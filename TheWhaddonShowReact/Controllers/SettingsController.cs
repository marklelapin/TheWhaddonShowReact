using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyClassLibrary.DataAccessMethods;
using System.Data;
using System.Net;
using System.Text.Json;
using TheWhaddonShowClassLibrary.Models;

namespace TheWhaddonShowReact.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class SettingsController : ControllerBase
    {
        private readonly SqlDataAccess _sqlDataAccess;
        private readonly string connectionStringName = "SQLServer";

        public SettingsController(SqlDataAccess sqlDataAccess)
        {
            _sqlDataAccess = sqlDataAccess;

        }

        [HttpPost("currentShow")]
        public async Task<IActionResult> PostCurrentShow([FromRoute] Guid showId)
        {
            try
            {
                var parameters = new DynamicParameters();
                parameters.Add("@ShowScriptItemId", showId, DbType.Guid, ParameterDirection.Input);

                await _sqlDataAccess.ExecuteStoredProcedure("spChangeCurrentShow", parameters, connectionStringName);


                return new ObjectResult("Success") { StatusCode = (int)HttpStatusCode.OK };

            }
            catch (Exception ex)
            {

                return new ObjectResult(ex.Message) { StatusCode = (int)HttpStatusCode.InternalServerError };
            }
        }

        [HttpGet("currentShow")]
        public async Task<IActionResult> GetCurrentShow()
        {
            try
            {
                var parameters = new DynamicParameters();
                parameters.Add("@ShowId", null, DbType.Guid, ParameterDirection.Output);

                await _sqlDataAccess.ExecuteStoredProcedure("spGetCurrentShow", parameters, connectionStringName);

                Guid? showId = parameters.Get<Guid?>("@ShowId");

                if (showId != null) return new ObjectResult(showId) { StatusCode = (int)HttpStatusCode.OK };
                return new ObjectResult(null) { StatusCode = (int)HttpStatusCode.NotFound };
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
                parameters.Add("@ShowDaysTillOpeningNight", cowboyShoutOut.ShowDaysTillOpeningNight, DbType.Boolean, ParameterDirection.Input);
                parameters.Add("@ShowCastingStatistics", cowboyShoutOut.ShowCastingStatistics, DbType.Boolean, ParameterDirection.Input);
                parameters.Add("@NextRehearsalDate", cowboyShoutOut.NextRehearsalDate, DbType.DateTime, ParameterDirection.Input);
                parameters.Add("@AdditionalMessage", cowboyShoutOut.AdditionalMessage, DbType.String, ParameterDirection.Input);

                await _sqlDataAccess.ExecuteStoredProcedure("spUpdateCowboyShoutOut", parameters, connectionStringName);

                return new ObjectResult("SUCCESS") { StatusCode = (int)HttpStatusCode.OK };
            }
            catch (Exception ex)
            {
                return new ObjectResult(ex.Message) { StatusCode = (int)HttpStatusCode.InternalServerError };
            }

        }

        [HttpGet("cowboyShoutOut")]
        public async Task<IActionResult> GetCowboyShoutOut()
        {

            try
            {
                var parameters = new DynamicParameters();
                parameters.Add("@Output", null, DbType.String, ParameterDirection.Output);

                await _sqlDataAccess.ExecuteStoredProcedure("spGetCowboyShoutOut", parameters, connectionStringName);

                var output = parameters.Get<string>("@Output");
                CowboyShoutOut? cowboyShoutOut = JsonSerializer.Deserialize<CowboyShoutOut>(output);
                if (cowboyShoutOut == null) return new ObjectResult("Not Found") { StatusCode = (int)HttpStatusCode.NotFound };

                return new ObjectResult(cowboyShoutOut) { StatusCode = (int)HttpStatusCode.OK };
            }
            catch (Exception ex)
            {
                return new ObjectResult(ex.Message) { StatusCode = (int)HttpStatusCode.InternalServerError };
            }

        }



        [HttpPost("showDates")]
        [Authorize]
        public async Task<IActionResult> PostShowDates([FromBody] ShowDates showDates)
        {

            try
            {
                var parameters = new DynamicParameters();
                parameters.Add("@OpeningNight", showDates.OpeningNight, DbType.DateTime, ParameterDirection.Input);
                parameters.Add("@LastNight", showDates.LastNight, DbType.DateTime, ParameterDirection.Input);

                await _sqlDataAccess.ExecuteStoredProcedure("spChangeShowDates", parameters, connectionStringName);

                return new ObjectResult("SUCCESS") { StatusCode = (int)HttpStatusCode.OK };
            }
            catch (Exception ex)
            {
                return new ObjectResult(ex.Message) { StatusCode = (int)HttpStatusCode.InternalServerError };
            }

        }


        [HttpGet("showDates")]
        public async Task<IActionResult> GetShowDates()
        {

            try
            {
                var parameters = new DynamicParameters();
                parameters.Add("@Output", null, DbType.String, ParameterDirection.Output);

                await _sqlDataAccess.ExecuteStoredProcedure("spGetShowDates", parameters, connectionStringName);

                var output = parameters.Get<string>("@Output");
                ShowDates? showDates = JsonSerializer.Deserialize<ShowDates>(output);
                if (showDates == null) return new ObjectResult("Not Found") { StatusCode = (int)HttpStatusCode.NotFound };

                return new ObjectResult(showDates) { StatusCode = (int)HttpStatusCode.OK };
            }
            catch (Exception ex)
            {
                return new ObjectResult(ex.Message) { StatusCode = (int)HttpStatusCode.InternalServerError };
            }

        }

    }
}
   
