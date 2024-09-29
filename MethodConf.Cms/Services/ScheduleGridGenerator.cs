using MethodConf.Cms.Domain;
using MethodConf.Cms.Services.Interfaces;

namespace MethodConf.Cms.Services;

public class ScheduleGridGenerator : IScheduleGridGenerator
{
    public string[][] GenerateGrid(IEnumerable<ScheduleItem> scheduleItems)
    {
        return scheduleItems.OfType<TrackItem>()
            .Select(track => track.Sessions.Select(session => session.Key).ToArray()).ToArray();
    }
}
