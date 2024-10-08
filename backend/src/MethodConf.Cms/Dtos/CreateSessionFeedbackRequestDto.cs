using System.ComponentModel.DataAnnotations;

namespace MethodConf.Cms.Dtos;

public class CreateSessionFeedbackRequestDto
{
    [Range(1, 5)]
    public required int SpeakerRating { get; set; }

    [Range(1, 5)]
    public required int ContentRating { get; set; }

    [Range(1, 5)]
    public required int VenueRating { get; set; }

    [MaxLength(5000)]
    public string? Comments { get; set; }

    [MaxLength(255)]
    public string? Name { get; set; }

    [MaxLength(255)]
    public string? Email { get; set; }
}
