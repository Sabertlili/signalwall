using System.Text.Json;
using System.Text.Json.Nodes;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

namespace SignalWall;

public sealed class ControlCenterForm : Form
{
    private readonly string webRoot;
    private readonly ConfigStore configStore;
    private readonly Action applyConfiguration;
    private readonly Action reloadWallpapers;
    private readonly WebView2 webView;

    public ControlCenterForm(string webRoot, Action applyConfiguration, Action reloadWallpapers)
    {
        this.webRoot = webRoot;
        this.applyConfiguration = applyConfiguration;
        this.reloadWallpapers = reloadWallpapers;
        configStore = new ConfigStore(webRoot);

        Text = "SignalWall Control Center";
        Width = 1320;
        Height = 900;
        MinimumSize = new Size(860, 640);
        StartPosition = FormStartPosition.CenterScreen;
        BackColor = Color.FromArgb(9, 11, 13);
        Icon = Icon.ExtractAssociatedIcon(Application.ExecutablePath);

        webView = new WebView2
        {
            Dock = DockStyle.Fill,
            DefaultBackgroundColor = BackColor
        };

        Controls.Add(webView);
    }

    protected override async void OnShown(EventArgs e)
    {
        base.OnShown(e);
        if (webView.CoreWebView2 is not null) return;

        try
        {
            await webView.EnsureCoreWebView2Async();
            var core = webView.CoreWebView2
                ?? throw new InvalidOperationException("WebView2 did not initialize.");
            core.Settings.AreDefaultContextMenusEnabled = false;
            core.Settings.AreDevToolsEnabled = false;
            core.Settings.IsStatusBarEnabled = false;
            core.WebMessageReceived += OnWebMessageReceived;

            var controlCenterPath = Path.Combine(webRoot, "control-center.html");
            webView.Source = new Uri(
                $"{new Uri(controlCenterPath).AbsoluteUri}?host=signalwall&t={DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}");
        }
        catch (Exception ex)
        {
            ShowError(ex.Message);
        }
    }

    private void OnWebMessageReceived(object? sender, CoreWebView2WebMessageReceivedEventArgs e)
    {
        using var document = JsonDocument.Parse(e.WebMessageAsJson);
        var root = document.RootElement;
        var requestId = root.TryGetProperty("id", out var idElement)
            ? idElement.GetString() ?? string.Empty
            : string.Empty;
        var type = root.TryGetProperty("type", out var typeElement)
            ? typeElement.GetString() ?? string.Empty
            : string.Empty;

        try
        {
            switch (type)
            {
                case "state":
                    SendSuccess(requestId, BuildState());
                    break;
                case "save":
                    SaveConfiguration(root);
                    applyConfiguration();
                    SendSuccess(requestId, new JsonObject
                    {
                        ["savedAt"] = DateTime.Now.ToString("HH:mm:ss")
                    });
                    break;
                case "reload":
                    reloadWallpapers();
                    SendSuccess(requestId, new JsonObject
                    {
                        ["reloadedAt"] = DateTime.Now.ToString("HH:mm:ss")
                    });
                    break;
                default:
                    throw new InvalidOperationException($"Unknown control center request: {type}");
            }
        }
        catch (Exception ex)
        {
            SendError(requestId, ex.Message);
        }
    }

    private JsonObject BuildState()
    {
        var screens = Screen.AllScreens
            .OrderBy(item => item.Bounds.Left)
            .ThenBy(item => item.Bounds.Top)
            .Select(item => new
            {
                index = ScreenSlotResolver.Resolve(item.Bounds),
                name = item.DeviceName,
                primary = item.Primary,
                bounds = $"{item.Bounds.Left},{item.Bounds.Top},{item.Bounds.Width},{item.Bounds.Height}"
            })
            .ToArray();

        return new JsonObject
        {
            ["config"] = configStore.Read(),
            ["screens"] = JsonSerializer.SerializeToNode(screens)
        };
    }

    private void SaveConfiguration(JsonElement root)
    {
        if (!root.TryGetProperty("payload", out var payload) ||
            !payload.TryGetProperty("config", out var config))
        {
            throw new InvalidDataException("The control center did not send a configuration.");
        }

        configStore.Write(config);
    }

    private void SendSuccess(string requestId, JsonNode payload)
    {
        SendResponse(new JsonObject
        {
            ["id"] = requestId,
            ["ok"] = true,
            ["payload"] = payload
        });
    }

    private void SendError(string requestId, string message)
    {
        SendResponse(new JsonObject
        {
            ["id"] = requestId,
            ["ok"] = false,
            ["error"] = message
        });
    }

    private void SendResponse(JsonObject response)
    {
        webView.CoreWebView2?.PostWebMessageAsJson(response.ToJsonString());
    }

    private void ShowError(string message)
    {
        Controls.Clear();
        Controls.Add(new Label
        {
            Dock = DockStyle.Fill,
            ForeColor = Color.White,
            BackColor = BackColor,
            Padding = new Padding(32),
            TextAlign = ContentAlignment.MiddleCenter,
            Text = $"SignalWall could not open the control center.{Environment.NewLine}{Environment.NewLine}{message}"
        });
    }
}
