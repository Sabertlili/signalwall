namespace SignalWall;

public static class ScreenSlotResolver
{
    public static int Resolve(Rectangle bounds)
    {
        if (bounds.Left < -200) return 2;
        if (bounds.Left > 1200) return 1;
        return 3;
    }
}
