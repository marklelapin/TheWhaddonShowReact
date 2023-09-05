using MyApiMonitorClassLibrary.Interfaces;
using MyApiMonitorClassLibrary.Models;
using MyClassLibrary.DataAccessMethods;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllersWithViews();

builder.Services.AddTransient<IMongoDBDataAccess>(sp => new MongoDBDataAccess(builder.Configuration.GetValue<string>("MongoDatabase:DatabaseName")!
																			 , builder.Configuration.GetValue<string>("MongoDatabase:ConnectionString")!));
builder.Services.AddTransient<IApiTestDataAccess, ApiTestMongoDataAccess>();
builder.Services.AddTransient<IChartDataProcessor, ChartDataProcessor>();




var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
	// The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
	app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();


app.MapControllerRoute(
	name: "default",
	pattern: "{controller}/{action=Index}/{id?}");

app.MapFallbackToFile("index.html"); ;

app.Run();
