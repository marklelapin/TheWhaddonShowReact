﻿using Microsoft.AspNetCore.Mvc;
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
	public class PartsController : ControllerBase
	{

		private readonly ReactLocalDataAccess<PartUpdate> _localDataAccess;
		private readonly ILocalServerEngine<PartUpdate> _localServerEngine;
		private readonly JsonSerializerOptions jsonOptions = new SyncJsonOptions().JsonOptions;



		public PartsController(ILocalDataAccess<PartUpdate> localDataAccess, ILocalServerEngine<PartUpdate> localServerEngine)
		{
			// Cast _localDataAccess to ReactLocalDataAccess<PersonUpdate>
			if (localDataAccess is ReactLocalDataAccess<PartUpdate> reactLocalDataAccess) //TODO: replace with IRemoteLocalDataAccess interface to avoid this hack.
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




		// POST api/part/sync
		[HttpPost("sync")]
		public Task<IActionResult> Post([FromBody] LocalToServerSyncData<PartUpdate> syncData)
		{
			if (syncData == null) return Task.FromResult<IActionResult>(BadRequest());

			if (syncData != null)
			{

				_localDataAccess.setLocalToServerSyncData(syncData);

				(DateTime? syncedDataTime, bool success) = _localServerEngine.TrySync().Result; //Can localserverEngine TrySync() be made async? (not sure)

				if (success)
				{
					var serverToLocalSyncData = _localDataAccess.getServerToLocalSyncData();

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


	}
}
