using MethodConf.Cms.Mapping;
using MethodConf.Cms.Services.Interfaces;
using RazorLight;

namespace MethodConf.Cms.Services;

public static class DependencyInjection
{
    public static IHostApplicationBuilder AddApplicationServices(this IHostApplicationBuilder builder)
    {
        builder.Services.AddSingleton<IRazorLightEngine>(_ =>
        {
            return new RazorLightEngineBuilder()
                .UseEmbeddedResourcesProject(typeof(Program))
                .SetOperatingAssembly(typeof(Program).Assembly)
                .UseMemoryCachingProvider()
                .Build();
        });

        builder.Services.AddScoped<IScheduleGridGenerator, ScheduleGridGenerator>();
        builder.Services.AddScoped<IConferenceScheduleService, ConferenceScheduleService>();
        builder.Services.AddScoped<ISessionFeedbackService, SessionFeedbackService>();
        builder.Services.AddScoped<IConferenceIssueService, ConferenceIssueService>();
        builder.Services.AddAutoMapper(typeof(DefaultProfile));

        return builder;
    }
}
