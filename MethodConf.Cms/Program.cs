using MethodConf.Cms.Dtos;
using MethodConf.Cms.Mapping;
using MethodConf.Cms.Services;
using MethodConf.Cms.Services.Interfaces;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

builder.CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .AddDeliveryApi()
    .AddComposers()
    .Build();

builder.Services.AddScoped<IScheduleGridGenerator, ScheduleGridGenerator>();
builder.Services.AddScoped<IConferenceScheduleService, ConferenceScheduleService>();
builder.Services.AddAutoMapper(typeof(DefaultProfile));

var app = builder.Build();

app.UseSerilogRequestLogging(options =>
{
    options.IncludeQueryInRequestPath = true;
});

await app.BootUmbracoAsync();

app.MapControllerRoute("default", "/",
    new { Controller = "Home", Action = "Index" });

app.UseUmbraco()
    .WithMiddleware(u =>
    {
        u.UseBackOffice();
        u.UseWebsite();
    })
    .WithEndpoints(u =>
    {
        u.UseBackOfficeEndpoints();
        u.UseWebsiteEndpoints();
    });

await app.RunAsync();
