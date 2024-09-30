using Asp.Versioning;
using AutoMapper;
using MethodConf.Cms.Dtos;
using MethodConf.Cms.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace MethodConf.Cms.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route(RouteTemplates.ConferenceSchedule)]
public class ConferenceScheduleController(IConferenceScheduleService conferenceScheduleService, IMapper mapper) : Controller
{
    [HttpGet]
    public ActionResult<ConferenceScheduleResponseDto> GetSchedule(Guid conferenceId)
    {
        var conferenceSchedule = conferenceScheduleService.GetSchedule(conferenceId);

        if (conferenceSchedule is null)
        {
            return NotFound();
        }

        return Ok(mapper.Map<ConferenceScheduleResponseDto>(conferenceSchedule));
    }
}
