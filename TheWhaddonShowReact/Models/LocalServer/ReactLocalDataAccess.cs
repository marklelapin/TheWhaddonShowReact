using MyClassLibrary.LocalServerMethods.Interfaces;
using MyClassLibrary.LocalServerMethods.Models;

namespace TheWhaddonShowReact.Models.LocalServer
{
	public class ReactLocalDataAccess<T> : ILocalDataAccess<T> where T : ILocalServerModelUpdate
	{
		private LocalToServerSyncData<T> _localToServerSyncData { get; set; } = new LocalToServerSyncData<T>();

		private ServerToLocalSyncData<T> _serverToLocalSyncData { get; set; } = new ServerToLocalSyncData<T>();

		public ReactLocalDataAccess()
		{

		}

		//takes in data from local server via controller so that sync operation can be carried out on server.
		public void setLocalToServerSyncData(LocalToServerSyncData<T> syncData)
		{
			this._localToServerSyncData = syncData;
		}

		//Methods that alter local data save the changes to this object so that they can be sent back to local server via controller.
		//Actual changes get carried out within the React code on local server.
		public ServerToLocalSyncData<T> getServerToLocalSyncData()
		{
			return this._serverToLocalSyncData;
		}

		public async Task ClearConflictsFromLocal(List<Guid> ids)
		{
			await Task.Run(() => _serverToLocalSyncData.ConflictIdsToClear = ids);
		}

		public Task DeleteFromLocal(List<T> updates)
		{
			throw new NotImplementedException(); //TODO Delete functionalitiy not partof core fucntionality as carried out by updates to inactive.
		}

		public Task<List<T>> GetConflictedUpdatesFromLocal(List<Guid>? ids = null)
		{
			throw new NotImplementedException("Deprecated: this should be received from server instead of local"); //TODO remove this from ILocalDataAccess and ILocalServerEngine
		}

		public async Task<Guid> GetLocalCopyID()
		{

			var copyId = await Task.Run(() => _localToServerSyncData.CopyId);

			if (copyId == null)
			{
				throw new Exception("Cannot get copyId from localToServerSyncData. This should have been set within the React App code.");
			}
			else
			{
				await Task.Run(() => _localToServerSyncData.CopyId = copyId);

				return (Guid)copyId;
			}


		}

		public Task<DateTime> GetLocalLastSyncDate()
		{
			throw new NotImplementedException("Deprecated: the local last synced date doesn't need to be sent back to server"); //TODO remove this from ILocalDataAccess and ILocalServerEngine
		}

		public async Task<List<T>> GetUnsyncedFromLocal()
		{
			var updates = await Task.Run(() => _localToServerSyncData.Updates);
			return updates ?? new List<T>();
		}

		public Task<List<T>> GetUpdatesFromLocal(List<Guid>? ids = null, bool latestOnly = false)
		{
			throw new NotImplementedException("Deprecated: This functionality is carried out within React code on local server in this instance.");  //TODO if need be think it should just be same as get unsynced from local.
		}

		public Task<bool> ResetSampleData(List<T> sampleUpdates)
		{
			throw new NotImplementedException("Deprecated: this is required for api server testing and shouldn't be part of local data access?"); //TODO check if this is still required.
		}

		public async Task SaveLocalLastSyncDate(DateTime lastSyncDate)
		{
			await Task.Run(() => _serverToLocalSyncData.LastSyncDate = lastSyncDate);
		}

		public async Task<List<LocalToServerPostBack>> SaveUpdatesToLocal(List<T> updates)
		{
			//remove any updates that match incoming serverToLocalSyncData.PostBacks

			updates.RemoveAll(update => _serverToLocalSyncData.PostBacks.Any(postBack => postBack.Id == update.Id && postBack.Created == update.Created));

			//send reduced list of updates to local server staging property
			await Task.Run(() => _serverToLocalSyncData.Updates = updates);
			//send postbacks to Server.
			return _localToServerSyncData.PostBacks ?? new List<LocalToServerPostBack>();
		}

		public async Task ServerPostBackToLocal(List<ServerToLocalPostBack> postBacks)
		{
			await Task.Run(() => _serverToLocalSyncData.PostBacks = postBacks);
		}
	}
}
