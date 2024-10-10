using FluentResults;
using MethodConf.Cms.Domain;

namespace MethodConf.Cms.Services.Interfaces;

public interface IConferenceIssueService
{
    public Task<Result<Issue>> CreateIssue(Guid conferenceId, CreateIssue createIssue);
}
