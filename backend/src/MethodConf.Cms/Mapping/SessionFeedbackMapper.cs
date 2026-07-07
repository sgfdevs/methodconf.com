using MethodConf.Cms.Domain;
using MethodConf.Cms.Dtos;
using Riok.Mapperly.Abstractions;

namespace MethodConf.Cms.Mapping;

[Mapper]
public partial class SessionFeedbackMapper
{
    [MapProperty(nameof(CreateSessionFeedbackRequestDto.Comments), nameof(CreateSessionFeedback.Comments), Use = nameof(NullToEmpty))]
    public partial CreateSessionFeedback ToCreateSessionFeedback(CreateSessionFeedbackRequestDto src);

    [MapperIgnoreSource(nameof(SessionFeedback.SessionId))]
    [MapperIgnoreSource(nameof(SessionFeedback.CreatedAt))]
    public partial SessionFeedbackResponseDto ToDto(SessionFeedback src);

    public SessionFeedback ToSessionFeedback(CreateSessionFeedback src)
    {
        return new SessionFeedback
        {
            Id = Guid.Empty,
            SessionId = Guid.Empty,
            SpeakerRating = src.SpeakerRating,
            ContentRating = src.ContentRating,
            VenueRating = src.VenueRating,
            Comments = src.Comments,
            Name = src.Name,
            Email = src.Email,
        };
    }

    private static string NullToEmpty(string? value) => value ?? "";
}
