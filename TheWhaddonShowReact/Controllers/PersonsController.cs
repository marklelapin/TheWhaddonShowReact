using Microsoft.AspNetCore.Mvc;
using MyClassLibrary.LocalServerMethods.Interfaces;
using TheWhaddonShowClassLibrary.Models;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace TheWhaddonShowReact.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class PersonsController : ControllerBase
	{

		private readonly ILocalServerModelFactory<Person, PersonUpdate> _personFactory;

		public PersonsController(ILocalServerModelFactory<Person, PersonUpdate> personFactory)
		{
			_personFactory = personFactory;
		}


		// GET: api/<PersonsController>
		[HttpGet]
		public async Task<IActionResult> Get()
		{
			List<Person> persons = await _personFactory.CreateModelList();

			List<PersonUpdate> personsLatest = persons.Select(x => x.Latest).ToList();

			return Ok(personsLatest.ToArray());
		}

		// GET api/<PersonsController>/5
		[HttpGet("{id}")]
		public string Get(int id)
		{
			return "value";
		}

		// POST api/<PersonsController>
		[HttpPost]
		public void Post([FromBody] string value)
		{
		}

		// PUT api/<PersonsController>/5
		[HttpPut("{id}")]
		public void Put(int id, [FromBody] string value)
		{
		}

		// DELETE api/<PersonsController>/5
		[HttpDelete("{id}")]
		public void Delete(int id)
		{
		}
	}
}
