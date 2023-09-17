using MyClassLibrary.LocalServerMethods.Interfaces;
using MyClassLibrary.LocalServerMethods.Models;

namespace TheWhaddonShowReact.Models.LocalServer
{
	public class LocalToServerSyncData<T> where T : ILocalServerModelUpdate
	{
		public Guid? CopyId { get; set; }

		public List<LocalToServerPostBack>? PostBacks { get; set; }

		public List<T>? Updates { get; set; }


		public LocalToServerSyncData()
		{

		}


		public LocalToServerSyncData(Guid copyId, List<LocalToServerPostBack>? postBacks, List<T>? updates)
		{
			CopyId = copyId;
			PostBacks = postBacks;
			Updates = updates;
		}

	}
}
