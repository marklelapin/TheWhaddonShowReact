using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.FileProviders;
using Microsoft.Identity.Web;
using MyApiMonitorClassLibrary.Interfaces;
using MyApiMonitorClassLibrary.Models;
using MyClassLibrary.DataAccessMethods;
using MyClassLibrary.Extensions;
using MyClassLibrary.LocalServerMethods.Interfaces;
using MyClassLibrary.LocalServerMethods.Models;
using System.IO.Abstractions;
using TheWhaddonShowClassLibrary.DataAccess;




var builder = WebApplication.CreateBuilder(args);

builder.ConfigureMicrosoftIdentityWebAuthenticationAndUI("AzureAdB2C");

builder.RequireAuthorizationThroughoutAsFallbackPolicy();

builder.ByPassAuthenticationIfInDevelopment();

// Add services to the container.
if (builder.Environment.IsDevelopment()) //allows file upload from localhost:44442 in development.
{
	builder.Services.AddCors(options =>
	{
		options.AddPolicy("AllowDevelopmentOrigin", builder =>
	{
		builder.WithOrigins("http://localhost:44442")
			   .AllowAnyHeader()
			   .AllowAnyMethod()
			   .AllowCredentials();




		//WithOrigins("http://localhost:44442")
		//.AllowAnyHeader()
		//	   .AllowAnyMethod();
	});
	});
}

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

// File uploading services
builder.Services.AddSingleton<IFileSystem, FileSystem>();
builder.Services.AddSingleton<IContentTypeProvider, FileExtensionContentTypeProvider>();




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

//Configuration for file uploading
app.UseStaticFiles(new StaticFileOptions
{
	FileProvider = new PhysicalFileProvider(
				Path.Combine(Directory.GetCurrentDirectory(), "uploads")),
	RequestPath = "/uploads"
});



//Configuration for routing
app.UseHttpsRedirection();

app.UseCookiePolicy();

app.UseRouting();


app.UseAuthentication();
app.UseAuthorization();


app.MapControllerRoute(
	name: "default",
	pattern: "{controller}/{action=Index}/{id?}");

app.MapFallbackToFile("index.html"); ;

app.Run();
