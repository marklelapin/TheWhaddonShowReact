using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Identity.Web;
using MyApiMonitorClassLibrary.Interfaces;
using MyApiMonitorClassLibrary.Models;
using MyClassLibrary.Configuration;
using MyClassLibrary.DataAccessMethods;
using MyClassLibrary.Email;
using MyClassLibrary.Extensions;
using MyClassLibrary.Interfaces;
using MyClassLibrary.LocalServerMethods.Interfaces;
using MyClassLibrary.LocalServerMethods.Models;
using MyClassLibrary.OpenAI;
using System.IO.Abstractions;
using TheWhaddonShowClassLibrary.DataAccess;
using TheWhaddonShowReact.Models.LocalServer;

var builder = WebApplication.CreateBuilder(args);

builder.ConfigureMicrosoftIdentityWebAuthenticationAndUI("AzureAdB2C");

builder.RequireAuthorizationThroughoutAsFallbackPolicy();

//builder.ByPassAuthenticationIfInDevelopment();
builder.Services.AddSingleton<IAuthorizationHandler, ByPassAuthorization>();
// Add services to the container.
if (builder.Environment.IsDevelopment())
{
	builder.Services.AddCors(options =>
	{
		options.AddPolicy("AllowDevelopmentOrigin", builder =>
	{
		builder.WithOrigins("https://localhost:60001")
			   .AllowAnyHeader()
			   .AllowAnyMethod()
			   .AllowCredentials();
	});
	});

}
builder.Services.AddCors(options =>
{
	options.AddPolicy("AllowTheWhaddonShow.AzureWebsites.net", builder =>
	{
		builder.WithOrigins("https://www.thewhaddonshow.org")
			   .AllowAnyHeader()
			   .AllowAnyMethod()
			   .AllowCredentials();
	});
});
builder.Services.AddDownstreamApi("TheWhaddonShowApi", builder.Configuration.GetSection("TheWhaddonShowApi"));

builder.Services.AddHttpClient("OpenAI", opts =>
{
	opts.BaseAddress = new Uri(builder.Configuration.GetValue<string>("OpenAIApi:BaseUrl"));
	opts.DefaultRequestHeaders.Add("Authorization", $"Bearer {builder.Configuration.GetValue<string>("OpenAIApi:ApiKey")}");
});





builder.Services.AddControllersWithViews(options =>
{
	options.InputFormatters.Add(new TextPlainInputFormatter());
});


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
builder.Services.AddScoped(typeof(ILocalDataAccess<>), typeof(ReactLocalDataAccess<>));
builder.Services.AddScoped(typeof(IServerDataAccess<>), typeof(APIServerDataAccess<>));
builder.Services.AddScoped(typeof(ILocalServerEngine<>), typeof(LocalServerEngine<>));
builder.Services.AddTransient<IOpenAIControllerService, OpenAIControllerService>();
// File uploading services
builder.Services.AddSingleton<IFileSystem, FileSystem>();
builder.Services.AddSingleton<IContentTypeProvider, FileExtensionContentTypeProvider>();
//Email services
builder.Services.AddTransient<IEmailClient, HotmailClient>();
//Configuration services
builder.Services.AddSingleton<IConfiguration>(builder.Configuration);





var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
	// The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
	app.UseHsts();
}

//All file uploading from local host in development
if (app.Environment.IsDevelopment())
{
	app.UseCors("AllowDevelopmentOrigin");
}



app.UseDefaultFiles();
app.UseStaticFiles();

//Configuration for routing
if (app.Environment.IsDevelopment() == false)
{
	app.UseHttpsRedirection();
}


app.UseCookiePolicy();

app.UseRouting();


app.UseAuthentication();
app.UseAuthorization();


app.MapControllerRoute(
	name: "default",
	pattern: "{controller}/{action=Index}/{id?}");

app.MapFallbackToFile("index.html"); ;

app.Run();
