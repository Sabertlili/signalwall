using System.Text.Json;

namespace SignalWall.Tests;

public sealed class ConfigStoreTests : IDisposable
{
    private readonly string testRoot = Path.Combine(
        Path.GetTempPath(),
        $"signalwall-tests-{Guid.NewGuid():N}");

    public ConfigStoreTests()
    {
        Directory.CreateDirectory(testRoot);
    }

    [Fact]
    public void WriteAndRead_RoundTripsConfiguration()
    {
        var store = new ConfigStore(testRoot);
        using var document = JsonDocument.Parse(ValidConfiguration);

        store.Write(document.RootElement);

        var result = store.Read();
        Assert.Equal(1, result["version"]?.GetValue<int>());
        Assert.Equal("Focus", result["textThemes"]?[0]?["label"]?.GetValue<string>());
    }

    [Fact]
    public void ReadScreenOrder_CompletesMissingSlotsWithoutDuplicates()
    {
        var store = new ConfigStore(testRoot);
        using var document = JsonDocument.Parse(ValidConfiguration.Replace("[3, 1]", "[1]"));
        store.Write(document.RootElement);

        Assert.Equal([1, 2, 3], store.ReadScreenOrder());
    }

    [Fact]
    public void ReadScreenOrder_ReturnsSafeFallbackForCorruptFile()
    {
        File.WriteAllText(
            Path.Combine(testRoot, "quote-signal-config.js"),
            "window.QUOTE_SIGNAL_CONFIG = definitely-not-json;");

        var store = new ConfigStore(testRoot);

        Assert.Equal([2, 3, 1], store.ReadScreenOrder());
    }

    [Fact]
    public void Write_RejectsConfigurationWithoutThemes()
    {
        var store = new ConfigStore(testRoot);
        using var document = JsonDocument.Parse("""{"defaults":{},"textThemes":[],"colorThemes":[]}""");

        var exception = Assert.Throws<InvalidDataException>(() => store.Write(document.RootElement));

        Assert.Contains("textThemes", exception.Message);
    }

    public void Dispose()
    {
        if (Directory.Exists(testRoot))
        {
            Directory.Delete(testRoot, true);
        }
    }

    private const string ValidConfiguration = """
        {
          "version": 1,
          "defaults": {
            "screenOrder": [3, 1]
          },
          "textThemes": [
            {
              "id": "focus",
              "label": "Focus",
              "quotes": [
                {
                  "text": "Do fewer things with more consequence.",
                  "author": "Focus note"
                }
              ]
            }
          ],
          "colorThemes": [
            {
              "id": "signal",
              "label": "Signal",
              "text": ["#ffffff", "#eeeeee", "#dddddd"],
              "accents": ["#ffaa00", "#00aa99", "#dd6677"],
              "particles": ["#ffaa00", "#00aa99", "#dd6677"],
              "background": {
                "top": "#000000",
                "middle": "#111111",
                "bottom": "#222222"
              }
            }
          ]
        }
        """;
}
