using MethodConf.Cms.Converters;
using MethodConf.Cms.Infrastructure;
using MethodConf.Cms.Services;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

builder.CreateUmbracoBuilder()
    .AddBackOffice(mvc =>
    {
        mvc.AddJsonOptions(options =>
        {
            options.JsonSerializerOptions.Converters.Add(new TwoDimensionalArrayConverterFactory());
        });
    })
    .AddWebsite()
    .AddDeliveryApi()
    .AddComposers()
    .Build();

builder.Services.AddSwaggerGen(opts =>
{
    opts.SchemaFilter<MultiDimensionalArraySchemaFilter>();
});

builder.AddApplicationInfrastructure();
builder.AddApplicationServices();

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
