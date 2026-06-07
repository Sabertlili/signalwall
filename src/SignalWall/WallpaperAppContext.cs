namespace SignalWall;

public sealed class WallpaperAppContext : ApplicationContext
{
    private readonly NotifyIcon trayIcon;
    private readonly List<WallpaperForm> forms = [];

    public WallpaperAppContext()
    {
        trayIcon = new NotifyIcon
        {
            Icon = SystemIcons.Application,
            Text = "SignalWall",
            Visible = true,
            ContextMenuStrip = BuildMenu()
        };

        StartWallpapers();
    }

    private ContextMenuStrip BuildMenu()
    {
        var menu = new ContextMenuStrip();
        menu.Items.Add("Reload wallpapers", null, (_, _) => ReloadWallpapers());
        menu.Items.Add("Open web folder", null, (_, _) => OpenWebFolder());
        menu.Items.Add(new ToolStripSeparator());
        menu.Items.Add("Exit", null, (_, _) => ExitThread());
        return menu;
    }

    private static string WebRoot => Path.Combine(AppContext.BaseDirectory, "web");

    private void StartWallpapers()
    {
        StopWallpapers();

        var workerWindow = DesktopWorker.EnsureWorkerWindow();
        foreach (var screen in Screen.AllScreens.OrderBy(item => item.Bounds.Left).ThenBy(item => item.Bounds.Top))
        {
            var slot = ScreenSlotResolver.Resolve(screen.Bounds);
            var form = new WallpaperForm(screen, slot, WebRoot);
            form.Show();
            DesktopWorker.AttachToDesktop(form.Handle, workerWindow, screen.Bounds);
            forms.Add(form);
        }
    }

    private void ReloadWallpapers()
    {
        foreach (var form in forms)
        {
            form.Reload();
        }
    }

    private static void OpenWebFolder()
    {
        if (!Directory.Exists(WebRoot))
        {
            MessageBox.Show($"Missing web folder:\n{WebRoot}", "SignalWall", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            return;
        }

        System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo
        {
            FileName = WebRoot,
            UseShellExecute = true
        });
    }

    private void StopWallpapers()
    {
        foreach (var form in forms)
        {
            form.Close();
            form.Dispose();
        }

        forms.Clear();
    }

    protected override void ExitThreadCore()
    {
        StopWallpapers();
        trayIcon.Visible = false;
        trayIcon.Dispose();
        base.ExitThreadCore();
    }
}
