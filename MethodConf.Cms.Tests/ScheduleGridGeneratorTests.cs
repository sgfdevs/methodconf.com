using MethodConf.Cms.Domain;
using MethodConf.Cms.Services;
using MethodConf.Cms.Services.Interfaces;
using MethodConf.Cms.Tests.Utilities;

namespace MethodConf.Cms.Tests;

public class ScheduleGridGeneratorTests
{
    private IScheduleGridGenerator _sut;

    [SetUp]
    public void Setup()
    {
        _sut = new ScheduleGridGenerator();
    }

    [Test]
    public void GenerateGrid_WithNoTracks_ReturnsValidGrid()
    {
        var schedule = new List<ScheduleItem>
        {
            new SessionItem { Key = "item1", Start = DateTime.Now, End = DateTime.Now.AddHours(1) },
            new SessionItem { Key = "item3", Start = DateTime.Now.AddHours(3), End = DateTime.Now.AddHours(4) },
            new SessionItem { Key = "item2", Start = DateTime.Now.AddHours(2), End = DateTime.Now.AddHours(3) },
        };

        var grid = _sut.GenerateGrid(schedule);

        // Assert.

        GridAssert.ThatGridsAreEqual(grid, new[,] {
            {"item1"},
            {"item2"},
            {"item3"},
        });
    }

    [Test]
    public void GenerateGrid_WithSimpleSchedule_ReturnsValidGrid()
    {
        var schedule = new List<ScheduleItem>
        {
            new TrackItem
            {
                Sessions =
                [
                    new SessionItem { Key = "item1", Start = DateTime.Now, End = DateTime.Now.AddHours(1) },
                    new SessionItem { Key = "item3", Start = DateTime.Now.AddHours(1), End = DateTime.Now.AddHours(2) },
                ]
            },
            new TrackItem
            {
                Sessions =
                [
                    new SessionItem { Key = "item4", Start = DateTime.Now.AddHours(1), End = DateTime.Now.AddHours(2) },
                    new SessionItem { Key = "item2", Start = DateTime.Now, End = DateTime.Now.AddHours(1) },
                ]
            }
        };

        var grid = _sut.GenerateGrid(schedule);

        GridAssert.ThatGridsAreEqual(grid, new[,] {
           {"item1", "item2"},
           {"item3", "item4"},
        });
    }
}
