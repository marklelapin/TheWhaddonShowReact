using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.FileProviders;
using MyApiMonitorClassLibrary.Interfaces;
using MyApiMonitorClassLibrary.Models;
using MyClassLibrary.DataAccessMethods;
using System.IO.Abstractions;

var builder = WebApplication.CreateBuilder(args);

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

builder.Services.AddControllersWithViews();

builder.Services.AddTransient<IMongoDBDataAccess>(sp => new MongoDBDataAccess(builder.Configuration.GetValue<string>("MongoDatabase:DatabaseName")!
																			 , builder.Configuration.GetValue<string>("MongoDatabase:ConnectionString")!));
builder.Services.AddTransient<IApiTestDataAccess, ApiTestMongoDataAccess>();
builder.Services.AddTransient<IChartDataProcessor, ChartDataProcessor>();


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
app.UseRouting();
app.MapControllerRoute(
	name: "default",
	pattern: "{controller}/{action=Index}/{id?}");

app.MapFallbackToFile("index.html"); ;

app.Run();
