using MethodConf.Cms.Domain;
using Umbraco.Cms.Web.Common.PublishedModels;

namespace MethodConf.Cms.Services.Interfaces;

public interface IConferenceScheduleService
{
    ConferenceSchedule? GetSchedule(string conferenceSlug);
}
