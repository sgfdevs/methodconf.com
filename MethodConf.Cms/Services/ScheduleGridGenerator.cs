using MethodConf.Cms.Domain;
using MethodConf.Cms.Services.Interfaces;

namespace MethodConf.Cms.Services;

public class ScheduleGridGenerator : IScheduleGridGenerator
{
    public string?[,] GenerateGrid(IEnumerable<ScheduleItem> scheduleItems)
    {
        var schedule = scheduleItems as ScheduleItem[] ?? scheduleItems.ToArray();
        var tracks = schedule.OfType<TrackItem>().ToArray();

        if (tracks.Length == 0)
        {
            var sessions = schedule.OfType<SessionItem>()
                .OrderBy(session => session.Start)
                .ToArray();

            var sessionOnlyGrid = new string?[sessions.Length, 1];

            for (var i = 0; i < sessionOnlyGrid.Length; i++)
            {
                sessionOnlyGrid[i, 0] = sessions[i].Key;
            }

            return sessionOnlyGrid;
        }

        foreach (var track in tracks)
        {
            track.Sessions = track.Sessions.OrderBy(session => session.Start).ToArray();
        }

        var grid = new string?[tracks.Length, tracks[0].Sessions.Length];

        for (var i = 0; i < grid.GetLength(0); i++)
        {
            for (var j = 0; j < grid.GetLength(1); j++)
            {
                grid[i, j] = tracks[j].Sessions[i].Key;
            }
        }

        return grid;
    }
}
