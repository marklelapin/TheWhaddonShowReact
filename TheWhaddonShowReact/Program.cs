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
using System.Net.Http.Headers;
using TheWhaddonShowClassLibrary.DataAccess;
using TheWhaddonShowReact.Models.LocalServer;

var builder = WebApplication.CreateBuilder(args);

////builder.ConfigureMicrosoftIdentityWebAuthenticationAndUI("AzureAdB2C");

////builder.RequireAuthorizationThroughoutAsFallbackPolicy();

////builder.ByPassAuthenticationIfInDevelopment();
//builder.Services.AddSingleton<IAuthorizationHandler, ByPassAuthorization>();



// Add services to the container.
if (builder.Environment.IsDevelopment())
{
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowDevelopmentOrigin", builder =>
    {
        builder.WithOrigins("https://localhost:40001","https://localhost:60001")
               .AllowAnyHeader()
               .AllowAnyMethod()
               .AllowCredentials();
    });
    });
}
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowTheWhaddonShow", builder =>
    {
        builder.WithOrigins("https://thewhaddonshowapp.azurewebsites.net")
               .AllowAnyHeader()
               .AllowAnyMethod()
               .AllowCredentials();
    });
});
//builder.Services.AddDownstreamApi("TheWhaddonShowApi", builder.Configuration.GetSection("TheWhaddonShowApi"));







builder.Services.AddControllersWithViews(options =>
{
    options.InputFormatters.Add(new TextPlainInputFormatter());
});
builder.Services.AddSingleton<IConfiguration>(builder.Configuration);

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
builder.Services.AddScoped(typeof(IServerDataAccess<>), typeof(APIServerDataAccessInjectingHttpClientFactory<>));
builder.Services.AddScoped(typeof(ILocalServerEngine<>), typeof(LocalServerEngine<>));
builder.Services.AddTransient<IOpenAIControllerService, OpenAIControllerService>();
// File uploading services
builder.Services.AddSingleton<IFileSystem, FileSystem>();
builder.Services.AddSingleton<IContentTypeProvider, FileExtensionContentTypeProvider>();
//Email services
builder.Services.AddTransient<IEmailClient, HotmailClient>();

builder.Services.AddTransient<IAuthorizationMethods, AuthorizationMethods>();
builder.Services.AddTransient<AuthorizationHeaderHandler>();

builder.Services.AddHttpClient("TheWhaddonShowApi", options =>
{
    options.BaseAddress = new Uri(builder.Configuration.GetValue<string>("TheWhaddonShowApi:BaseUrl"));
}).AddHttpMessageHandler<AuthorizationHeaderHandler>();


builder.Services.AddHttpClient("OpenAI", opts =>
{
    opts.BaseAddress = new Uri(builder.Configuration.GetValue<string>("OpenAIApi:BaseUrl"));
    opts.DefaultRequestHeaders.Add("Authorization", $"Bearer {builder.Configuration.GetValue<string>("OpenAIApi:ApiKey")}");
});




var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

//Allow file uploading from local host in development
if (app.Environment.IsDevelopment())
{
    app.UseCors("AllowDevelopmentOrigin");
}
app.UseCors("AllowTheWhaddonShow");


app.UseDefaultFiles();
app.UseStaticFiles();

//Configuration for routing
if (app.Environment.IsDevelopment() == false)
{
    app.UseHttpsRedirection();
}


app.UseCookiePolicy();

app.UseRouting();


//app.UseAuthentication();
//app.UseAuthorization();


app.MapControllerRoute(
    name: "default",
    pattern: "{controller}/{action=Index}/{id?}");

app.MapFallbackToFile("index.html"); ;

app.Run();
