using MyClassLibrary.LocalServerMethods.Interfaces;
using MyClassLibrary.LocalServerMethods.Models;

namespace TheWhaddonShowReact.Models.LocalServer
{
	public class ServerToLocalSyncData<T> where T : ILocalServerModelUpdate
	{
		public List<ServerToLocalPostBack> PostBacks { get; set; } = new List<ServerToLocalPostBack>();

		public List<T> Updates { get; set; } = new List<T>();

		public List<Guid> ConflictIdsToClear { get; set; } = new List<Guid>();

		public DateTime LastSyncDate { get; set; }
	}
}
