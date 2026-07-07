using MethodConf.Cms.Domain;
using MethodConf.Cms.Dtos;
using Riok.Mapperly.Abstractions;

namespace MethodConf.Cms.Mapping;

[Mapper]
public partial class SessionFeedbackMapper
{
    public partial CreateSessionFeedback ToCreateSessionFeedback(CreateSessionFeedbackRequestDto src);

    [MapperIgnoreSource(nameof(SessionFeedback.SessionId))]
    [MapperIgnoreSource(nameof(SessionFeedback.CreatedAt))]
    public partial SessionFeedbackResponseDto ToDto(SessionFeedback src);

    [MapValue(nameof(SessionFeedback.Id), Use = nameof(EmptyGuid))]
    [MapValue(nameof(SessionFeedback.SessionId), Use = nameof(EmptyGuid))]
    [MapperIgnoreTarget(nameof(SessionFeedback.CreatedAt))]
    public partial SessionFeedback ToSessionFeedback(CreateSessionFeedback src);

    private static Guid EmptyGuid() => Guid.Empty;
}
