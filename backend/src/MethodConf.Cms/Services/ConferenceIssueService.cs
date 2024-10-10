using AutoMapper;
using FluentResults;
using MethodConf.Cms.Domain;
using MethodConf.Cms.Domain.Errors;
using MethodConf.Cms.Infrastructure;
using MethodConf.Cms.Services.Interfaces;
using RazorLight;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Mail;
using Umbraco.Cms.Web.Common.PublishedModels;

namespace MethodConf.Cms.Services;

public class ConferenceIssueService(
    IPublishedContentQuery publishedContentQuery,
    AppDbContext dbContext,
    IEmailSender emailSender,
    IRazorLightEngine razorEngine,
    IMapper mapper) : IConferenceIssueService
{
    public async Task<Result<Issue>> CreateIssue(Guid conferenceId, CreateIssue createIssue)
    {
        if (publishedContentQuery.Content(conferenceId) is not Conference conference)
        {
            return Result.Fail(new InvalidEntityIdError(conferenceId.ToString()));
        }

        var newIssue = mapper.Map<Issue>(createIssue);
        newIssue.ConferenceId = conference.Key;

        dbContext.Add(newIssue);
        await dbContext.SaveChangesAsync();

        return newIssue;
    }

    private async Task SendOrganizerEmail(Issue issue)
    {
        var content = razorEngine.
    }

    private async Task SendReporterEmail(Issue issue)
    {

    }
}
