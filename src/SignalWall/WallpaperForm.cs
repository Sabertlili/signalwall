using System.Text.Json;
using System.Text.Json.Nodes;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

namespace SignalWall;

public sealed class WallpaperForm : Form
{
    private readonly Screen screen;
    private readonly string webRoot;
    private readonly WebView2 webView;
    private int screenSlot;

    public WallpaperForm(Screen screen, int screenSlot, string webRoot)
    {
        this.screen = screen;
        this.screenSlot = screenSlot;
        this.webRoot = webRoot;

        Text = $"SignalWall Screen {screenSlot}";
        ShowInTaskbar = false;
        FormBorderStyle = FormBorderStyle.None;
        StartPosition = FormStartPosition.Manual;
        Bounds = screen.Bounds;

        webView = new WebView2
        {
            Dock = DockStyle.Fill,
            DefaultBackgroundColor = Color.Black
        };

        Controls.Add(webView);
    }

    public Rectangle ScreenBounds => screen.Bounds;

    protected override async void OnShown(EventArgs e)
    {
        base.OnShown(e);
        await InitializeWebViewAsync();
    }

    public void Reload()
    {
        Navigate();
    }

    public void ApplyConfiguration(int newScreenSlot, JsonNode config)
    {
        screenSlot = newScreenSlot;
        if (webView.CoreWebView2 is null)
        {
            return;
        }

        var json = config.ToJsonString();
        var script = $"window.signalWallApplyConfig?.(JSON.parse({JsonSerializer.Serialize(json)}), {screenSlot});";
        _ = webView.CoreWebView2.ExecuteScriptAsync(script);
    }

    private async Task InitializeWebViewAsync()
    {
        try
        {
            await webView.EnsureCoreWebView2Async();
            webView.CoreWebView2.Settings.AreDefaultContextMenusEnabled = false;
            webView.CoreWebView2.Settings.AreDevToolsEnabled = false;
            webView.CoreWebView2.NavigationCompleted += OnNavigationCompleted;
            Navigate();
        }
        catch (Exception ex)
        {
            Controls.Clear();
            Controls.Add(new Label
            {
                Dock = DockStyle.Fill,
                ForeColor = Color.White,
                BackColor = Color.Black,
                TextAlign = ContentAlignment.MiddleCenter,
                Text = $"SignalWall could not start WebView2.\n\n{ex.Message}"
            });
        }
    }

    private void Navigate()
    {
        var indexPath = Path.Combine(webRoot, "index.html");
        if (!File.Exists(indexPath))
        {
            MessageBox.Show($"Missing wallpaper file:\n{indexPath}", "SignalWall", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            return;
        }

        var url = new Uri(indexPath).AbsoluteUri;
        webView.Source = new Uri($"{url}?host=signalwall&screenSlot={screenSlot}&t={DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}");
    }

    private async void OnNavigationCompleted(object? sender, CoreWebView2NavigationCompletedEventArgs e)
    {
        if (!e.IsSuccess || webView.CoreWebView2 is null) return;

        var script = $"window.livelyPropertyListener?.('screenSlot', {screenSlot});";
        await webView.CoreWebView2.ExecuteScriptAsync(script);
    }

    protected override void OnResize(EventArgs e)
    {
        base.OnResize(e);
        if (Bounds != screen.Bounds)
        {
            Bounds = screen.Bounds;
        }
    }
}
