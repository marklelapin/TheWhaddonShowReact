using Microsoft.AspNetCore.Mvc;
using MyClassLibrary.LocalServerMethods.Interfaces;
using System.Text.Json;
using TheWhaddonShowClassLibrary.Models;
using TheWhaddonShowReact.Models;
using TheWhaddonShowReact.Models.LocalServer;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace TheWhaddonShowReact.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PersonsController : ControllerBase
    {

        private readonly ReactLocalDataAccess<PersonUpdate> _localDataAccess;
        private readonly ILocalServerEngine<PersonUpdate> _localServerEngine;
        private readonly JsonSerializerOptions jsonOptions = new SyncJsonOptions().JsonOptions;

        public PersonsController(ILocalDataAccess<PersonUpdate> localDataAccess, ILocalServerEngine<PersonUpdate> localServerEngine)
        {
            // Cast _localDataAccess to ReactLocalDataAccess<PersonUpdate>
            if (localDataAccess is ReactLocalDataAccess<PersonUpdate> reactLocalDataAccess) //TODO: replace with IRemoteLocalDataAccess interface to avoid this hack.
            {
                _localDataAccess = reactLocalDataAccess;
            }
            else
            {
                throw new Exception("localDataAccess<T> specifiedin Dependency Injection is not of type ReactLocalDataAccess<T>." +
                    " This is required in order for the api controller to interact with React app correctly.");
            }
            _localServerEngine = localServerEngine;
        }




        // POST api/person/sync
        [HttpPost("sync")]
        public Task<IActionResult> Post([FromBody] LocalToServerSyncData<PersonUpdate> syncData)
        {
            try
            {
                if (syncData == null) return Task.FromResult<IActionResult>(BadRequest());

                if (syncData != null)
                {

                    _localDataAccess.setLocalToServerSyncData(syncData);

                    (DateTime? syncedDataTime, bool success) = _localServerEngine.TrySync().Result; //Can localserverEngine TrySync() be made async? (not sure)


                    if (success)
                    {
                        var serverToLocalSyncData = _localDataAccess.getServerToLocalSyncData();

                        serverToLocalSyncData.Updates = serverToLocalSyncData.Updates.Where(update => update.IsSample == false).ToList();

                        var serverToLocalSyncDataJson = JsonSerializer.Serialize(serverToLocalSyncData, jsonOptions);

                        return Task.FromResult<IActionResult>(Ok(serverToLocalSyncDataJson));
                    }
                    else
                    {
                        return Task.FromResult<IActionResult>(BadRequest());
                    }

                }

                return Task.FromResult<IActionResult>(Content("syncData is null"));


            }
            catch (Exception ex)
            {
                if (ex is UnauthorizedAccessException)
                {
                    return Task.FromResult<IActionResult>(Unauthorized());
                }
                else
                {
                    return Task.FromResult<IActionResult>(BadRequest((ex.Message)));
                }

            }



        }


    }

}


