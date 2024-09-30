using System.ComponentModel.DataAnnotations;

namespace MethodConf.Cms.Dtos;

public class CreateSessionFeedbackRequestDto
{
    [Range(1, 10)]
    public required int SpeakerRating { get; set; }

    [Range(1, 10)]
    public required int ContentRating { get; set; }

    [Range(1, 10)]
    public required int VenueRating { get; set; }

    [MaxLength(5000)]
    public required string Comments { get; set; }
}