using MyClassLibrary.LocalServerMethods.Interfaces;
using TheWhaddonShowReact.Models.LocalServer;

namespace TheWhaddonShowReact.Interfaces
{
	public interface IRemoteLocalDataAccess<T> : ILocalDataAccess<T> where T : ILocalServerModelUpdate
	{
		//A Method that takes in syncData from local server via controller so that sync operation can be carried out on server.
		public void setLocalToServerSyncData(LocalToServerSyncData<T> syncData)
		{
		}

		//A method that returns the updates and postback calculated on server to the local application where it processes them onto local storage. 
		public ServerToLocalSyncData<T> getServerToLocalSyncData();
	}
}
