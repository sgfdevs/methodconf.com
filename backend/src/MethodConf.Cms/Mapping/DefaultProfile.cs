using AutoMapper;
using MethodConf.Cms.Domain;
using MethodConf.Cms.Dtos;
using Umbraco.Cms.Web.Common.PublishedModels;

namespace MethodConf.Cms.Mapping;

public class DefaultProfile : Profile
{
    public DefaultProfile()
    {
        CreateMap<ConferenceSchedule, ConferenceScheduleResponseDto>();
        CreateMap<Session, SessionItem>()
#pragma warning disable CS0618
            .ForMember(dest => dest.Key, opts => opts.MapFrom(src => src.UrlSegment));
#pragma warning restore CS0618
        CreateMap<Track, TrackItem>()
            .ForMember(dest => dest.Sessions, opts => opts.MapFrom((src, _) => src.Children<Session>() ?? []));

        CreateMap<CreateSessionFeedbackRequestDto, CreateSessionFeedback>();
        CreateMap<CreateSessionFeedback, SessionFeedback>();
        CreateMap<SessionFeedback, SessionFeedbackResponseDto>();

        CreateMap<CreateIssueRequestDto, CreateIssue>()
            .ForMember(dest => dest.PhoneNumber, opts => opts.MapFrom(src => src.Phone));
        CreateMap<CreateIssue, Issue>();
        CreateMap<Issue, IssueWithResponse>();
        CreateMap<IssueWithResponse, CreateIssueResponseDto>()
            .ForMember(dest => dest.Phone, opts => opts.MapFrom(src => src.PhoneNumber));
        CreateMap<Issue, NewIssueEmailViewModel>()
            .ForMember(dest => dest.Phone, opts => opts.MapFrom(src => src.PhoneNumber));
        CreateMap<Issue, NewIssueAppResponseViewModel>()
            .ForMember(dest => dest.Phone, opts => opts.MapFrom(src => src.PhoneNumber));
    }
}
