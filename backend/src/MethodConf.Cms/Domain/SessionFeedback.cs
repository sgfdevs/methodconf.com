using System.ComponentModel.DataAnnotations;

namespace MethodConf.Cms.Domain;

public class SessionFeedback
{
    public required Guid Id { get; set; }
    public required Guid SessionId { get; set; }

    public required int SpeakerRating { get; set; }

    public required int ContentRating { get; set; }

    public required int VenueRating { get; set; }

    [MaxLength(5000)]
    public string? Comments { get; set; }

    [MaxLength(255)]
    public string? Name { get; set; }

    [MaxLength(255)]
    public string? Email { get; set; }
}
