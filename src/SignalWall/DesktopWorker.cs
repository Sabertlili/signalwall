using System.Runtime.InteropServices;

namespace SignalWall;

public static partial class DesktopWorker
{
    private const uint SpawnWorkerWMessage = 0x052C;
    private const uint SmtoNormal = 0x0000;
    private const uint SwpNoZOrder = 0x0004;
    private const uint SwpNoActivate = 0x0010;
    private const uint SwpShowWindow = 0x0040;

    public static IntPtr EnsureWorkerWindow()
    {
        var progman = FindWindow("Progman", null);
        if (progman != IntPtr.Zero)
        {
            SendMessageTimeout(progman, SpawnWorkerWMessage, IntPtr.Zero, IntPtr.Zero, SmtoNormal, 1000, out _);
        }

        var workerWindow = IntPtr.Zero;
        EnumWindows((topHandle, _) =>
        {
            var shellView = FindWindowEx(topHandle, IntPtr.Zero, "SHELLDLL_DefView", null);
            if (shellView != IntPtr.Zero)
            {
                workerWindow = FindWindowEx(IntPtr.Zero, topHandle, "WorkerW", null);
            }

            return true;
        }, IntPtr.Zero);

        return workerWindow != IntPtr.Zero ? workerWindow : progman;
    }

    public static void AttachToDesktop(IntPtr windowHandle, IntPtr workerWindow, Rectangle bounds)
    {
        if (workerWindow != IntPtr.Zero)
        {
            SetParent(windowHandle, workerWindow);
        }

        SetWindowPos(
            windowHandle,
            IntPtr.Zero,
            bounds.Left,
            bounds.Top,
            bounds.Width,
            bounds.Height,
            SwpNoZOrder | SwpNoActivate | SwpShowWindow);
    }

    private delegate bool EnumWindowsProc(IntPtr topHandle, IntPtr parameter);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern IntPtr FindWindow(string className, string? windowName);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern IntPtr FindWindowEx(IntPtr parentHandle, IntPtr childAfter, string className, string? windowName);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern bool EnumWindows(EnumWindowsProc callback, IntPtr parameter);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern IntPtr SetParent(IntPtr childHandle, IntPtr newParentHandle);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern bool SetWindowPos(
        IntPtr windowHandle,
        IntPtr insertAfter,
        int x,
        int y,
        int width,
        int height,
        uint flags);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern IntPtr SendMessageTimeout(
        IntPtr windowHandle,
        uint message,
        IntPtr wParam,
        IntPtr lParam,
        uint flags,
        uint timeout,
        out IntPtr result);
}
