using MethodConf.Cms.Domain;
using MethodConf.Cms.Dtos;
using Riok.Mapperly.Abstractions;

namespace MethodConf.Cms.Mapping;

[Mapper]
public partial class IssueMapper
{
    [MapProperty(nameof(CreateIssueRequestDto.Phone), nameof(CreateIssue.PhoneNumber))]
    public partial CreateIssue ToCreateIssue(CreateIssueRequestDto src);

    [MapperIgnoreTarget(nameof(Issue.Id))]
    [MapperIgnoreTarget(nameof(Issue.ConferenceId))]
    [MapperIgnoreTarget(nameof(Issue.CreatedAt))]
    public partial Issue ToIssue(CreateIssue src);

    [MapperIgnoreSource(nameof(IssueWithResponse.Id))]
    [MapperIgnoreSource(nameof(IssueWithResponse.ConferenceId))]
    [MapProperty(nameof(IssueWithResponse.PhoneNumber), nameof(CreateIssueResponseDto.Phone))]
    public partial CreateIssueResponseDto ToCreateIssueResponseDto(IssueWithResponse src);

    [MapperIgnoreSource(nameof(Issue.Id))]
    [MapperIgnoreSource(nameof(Issue.ConferenceId))]
    [MapperIgnoreSource(nameof(Issue.CreatedAt))]
    [MapperIgnoreTarget(nameof(NewIssueEmailViewModel.Title))]
    [MapProperty(nameof(Issue.PhoneNumber), nameof(NewIssueEmailViewModel.Phone))]
    public partial NewIssueEmailViewModel ToNewIssueEmailViewModel(Issue src);

    [MapperIgnoreSource(nameof(Issue.Id))]
    [MapperIgnoreSource(nameof(Issue.ConferenceId))]
    [MapperIgnoreSource(nameof(Issue.CreatedAt))]
    [MapProperty(nameof(Issue.PhoneNumber), nameof(NewIssueAppResponseViewModel.Phone))]
    public partial NewIssueAppResponseViewModel ToNewIssueAppResponseViewModel(Issue src);

    public IssueWithResponse ToIssueWithResponse(Issue src)
    {
        return new IssueWithResponse
        {
            Id = src.Id,
            ConferenceId = src.ConferenceId,
            Message = src.Message,
            Resolution = src.Resolution,
            Name = src.Name,
            Email = src.Email,
            PhoneNumber = src.PhoneNumber,
            ResponseMarkup = "",
        };
    }
}
