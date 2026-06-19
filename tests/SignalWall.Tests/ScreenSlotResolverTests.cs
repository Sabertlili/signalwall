namespace SignalWall.Tests;

public sealed class ScreenSlotResolverTests
{
    [Theory]
    [InlineData(-1920, 2)]
    [InlineData(-201, 2)]
    [InlineData(-200, 3)]
    [InlineData(0, 3)]
    [InlineData(1200, 3)]
    [InlineData(1201, 1)]
    [InlineData(3840, 1)]
    public void Resolve_MapsPhysicalHorizontalPositionToExpectedSlot(int left, int expected)
    {
        var bounds = new Rectangle(left, 0, 1920, 1080);

        Assert.Equal(expected, ScreenSlotResolver.Resolve(bounds));
    }
}
