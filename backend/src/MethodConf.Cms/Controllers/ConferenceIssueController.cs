using Asp.Versioning;
using AutoMapper;
using MethodConf.Cms.Dtos;
using MethodConf.Cms.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace MethodConf.Cms.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route(RouteTemplates.ConferenceIssue)]
public class ConferenceIssueController(IConferenceIssueService conferenceIssueService, IMapper mapper) : Controller
{
    [HttpPost]
    public async Task<ActionResult<CreateIssueResponseDto>> CreateIssue(Guid conferenceId, CreateIssueRequestDto request)
    {
        await Task.CompletedTask;
        return Ok(new CreateIssueResponseDto
        {
            Message = request.Message,
            Resolution = request.Resolution,
            Name = request.Name,
            Email = request.Email,
            Phone = request.Phone,
            ResponseMarkup = """<p>This is some test markup with a <a href="https://google.com">link</a></p>""",
        });
    }
}
