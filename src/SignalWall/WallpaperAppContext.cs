namespace SignalWall;

public sealed class WallpaperAppContext : ApplicationContext
{
    private readonly NotifyIcon trayIcon;
    private readonly List<WallpaperForm> forms = [];
    private ControlCenterForm? controlCenter;

    public WallpaperAppContext()
    {
        trayIcon = new NotifyIcon
        {
            Icon = Icon.ExtractAssociatedIcon(Application.ExecutablePath) ?? SystemIcons.Application,
            Text = "SignalWall",
            Visible = true,
            ContextMenuStrip = BuildMenu()
        };

        StartWallpapers();
        ShowFirstRunExperience();
    }

    private ContextMenuStrip BuildMenu()
    {
        var menu = new ContextMenuStrip();
        menu.Items.Add("Open control center", null, (_, _) => OpenControlCenter());
        menu.Items.Add(new ToolStripSeparator());
        menu.Items.Add("Reload wallpapers", null, (_, _) => ReloadWallpapers());
        menu.Items.Add("Open wallpaper folder", null, (_, _) => OpenWebFolder());
        menu.Items.Add("Visit SignalWall website", null, (_, _) => OpenWebsite());
        menu.Items.Add(new ToolStripSeparator());
        menu.Items.Add("Exit", null, (_, _) => ExitThread());
        return menu;
    }

    private static string WebRoot => Path.Combine(AppContext.BaseDirectory, "web");

    private void StartWallpapers()
    {
        StopWallpapers();

        var workerWindow = DesktopWorker.EnsureWorkerWindow();
        var screens = Screen.AllScreens
            .OrderBy(item => item.Bounds.Left)
            .ThenBy(item => item.Bounds.Top)
            .ToArray();
        var screenOrder = new ConfigStore(WebRoot).ReadScreenOrder();

        for (var position = 0; position < screens.Length; position += 1)
        {
            var screen = screens[position];
            var slot = position < screenOrder.Count
                ? screenOrder[position]
                : ScreenSlotResolver.Resolve(screen.Bounds);
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

    private void OpenControlCenter()
    {
        if (controlCenter is null || controlCenter.IsDisposed)
        {
            controlCenter = new ControlCenterForm(WebRoot, ApplyConfiguration, ReloadWallpapers);
        }

        if (!controlCenter.Visible)
        {
            controlCenter.Show();
        }

        if (controlCenter.WindowState == FormWindowState.Minimized)
        {
            controlCenter.WindowState = FormWindowState.Normal;
        }

        controlCenter.BringToFront();
        controlCenter.Activate();
    }

    private void ApplyConfiguration()
    {
        var configStore = new ConfigStore(WebRoot);
        var config = configStore.Read();
        var screenOrder = configStore.ReadScreenOrder();

        for (var position = 0; position < forms.Count; position += 1)
        {
            var form = forms[position];
            var slot = position < screenOrder.Count
                ? screenOrder[position]
                : ScreenSlotResolver.Resolve(form.ScreenBounds);
            form.ApplyConfiguration(slot, config);
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

    private static void OpenWebsite()
    {
        System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo
        {
            FileName = "https://nestcells.com",
            UseShellExecute = true
        });
    }

    private void ShowFirstRunExperience()
    {
        var stateRoot = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "SignalWall");
        var markerPath = Path.Combine(stateRoot, "control-center-introduced-v0.2");

        if (!File.Exists(markerPath))
        {
            Directory.CreateDirectory(stateRoot);
            File.WriteAllText(markerPath, DateTimeOffset.UtcNow.ToString("O"));
            OpenControlCenter();
            return;
        }

        trayIcon.BalloonTipTitle = "SignalWall is running";
        trayIcon.BalloonTipText = "Open the tray menu to customize every screen.";
        trayIcon.ShowBalloonTip(4000);
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
        controlCenter?.Close();
        controlCenter?.Dispose();
        StopWallpapers();
        trayIcon.Visible = false;
        trayIcon.Dispose();
        base.ExitThreadCore();
    }
}
