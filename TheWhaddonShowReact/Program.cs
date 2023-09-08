using Microsoft.Identity.Web;
using MyApiMonitorClassLibrary.Interfaces;
using MyApiMonitorClassLibrary.Models;
using MyClassLibrary.DataAccessMethods;
using MyClassLibrary.Extensions;
using MyClassLibrary.LocalServerMethods.Interfaces;
using MyClassLibrary.LocalServerMethods.Models;
using TheWhaddonShowClassLibrary.DataAccess;




var builder = WebApplication.CreateBuilder(args);

builder.ConfigureMicrosoftIdentityWebAuthenticationAndUI("AzureAdB2C");

builder.RequireAuthorizationThroughoutAsFallbackPolicy();

builder.ByPassAuthenticationIfInDevelopment();

// Add services to the container.

builder.Services.AddDownstreamApi("TheWhaddonShowApi", builder.Configuration.GetSection("TheWhaddonShowApi"));



builder.Services.AddControllersWithViews();


//Api Monitor services
builder.Services.AddTransient<IMongoDBDataAccess>(sp =>
					new MongoDBDataAccess(builder.Configuration.GetValue<string>("ApiMonitorDatabase:DatabaseName")!
					, builder.Configuration.GetValue<string>("ApiMonitorDatabase:ConnectionString")!)
					);
builder.Services.AddTransient<IApiTestDataAccess, ApiTestMongoDataAccess>();
builder.Services.AddTransient<IChartDataProcessor, ChartDataProcessor>();

//Main Data Access services
builder.Services.AddTransient<ILocalServerModelUpdate, LocalServerModelUpdate>();
builder.Services.AddTransient(typeof(ILocalServerModel<>), typeof(LocalServerModel<>));
builder.Services.AddSingleton<ISqlDataAccess, SqlDataAccess>();
builder.Services.AddScoped(typeof(ILocalDataAccess<>), typeof(LocalSQLConnector<>));
builder.Services.AddScoped(typeof(IServerDataAccess<>), typeof(APIServerDataAccess<>));
builder.Services.AddScoped(typeof(ILocalServerEngine<>), typeof(LocalServerEngine<>));
builder.Services.AddScoped(typeof(ILocalServerModelFactory<,>), typeof(LocalServerModelFactory<,>));


var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
	// The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
	app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseCookiePolicy();

app.UseRouting();


app.UseAuthentication();
app.UseAuthorization();


app.MapControllerRoute(
	name: "default",
	pattern: "{controller}/{action=Index}/{id?}");

app.MapFallbackToFile("index.html"); ;

app.Run();
