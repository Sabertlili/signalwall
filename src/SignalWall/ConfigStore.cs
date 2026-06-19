using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;

namespace SignalWall;

public sealed partial class ConfigStore
{
    private readonly string configPath;

    public ConfigStore(string webRoot)
    {
        configPath = Path.Combine(webRoot, "quote-signal-config.js");
    }

    public JsonObject Read()
    {
        if (!File.Exists(configPath))
        {
            throw new FileNotFoundException("SignalWall configuration was not found.", configPath);
        }

        var source = File.ReadAllText(configPath, Encoding.UTF8);
        var match = ConfigPattern().Match(source);
        if (!match.Success)
        {
            throw new InvalidDataException("SignalWall configuration is not valid.");
        }

        return JsonNode.Parse(match.Groups["json"].Value)?.AsObject()
            ?? throw new InvalidDataException("SignalWall configuration is empty.");
    }

    public void Write(JsonElement config)
    {
        if (config.ValueKind != JsonValueKind.Object)
        {
            throw new InvalidDataException("SignalWall configuration must be a JSON object.");
        }

        var json = JsonSerializer.Serialize(config, new JsonSerializerOptions
        {
            WriteIndented = true
        });

        var temporaryPath = $"{configPath}.tmp";
        File.WriteAllText(
            temporaryPath,
            $"window.QUOTE_SIGNAL_CONFIG = {json};{Environment.NewLine}",
            new UTF8Encoding(false));
        File.Move(temporaryPath, configPath, true);
    }

    public IReadOnlyList<int> ReadScreenOrder()
    {
        var order = Read()["defaults"]?["screenOrder"]?.AsArray()
            .Select(item => item?.GetValue<int>() ?? 0)
            .Where(item => item is >= 1 and <= 3)
            .Distinct()
            .ToList() ?? [];

        foreach (var fallback in new[] { 2, 3, 1 })
        {
            if (!order.Contains(fallback))
            {
                order.Add(fallback);
            }
        }

        return order.Take(3).ToArray();
    }

    [GeneratedRegex(
        @"window\.QUOTE_SIGNAL_CONFIG\s*=\s*(?<json>\{[\s\S]*\})\s*;?\s*$",
        RegexOptions.CultureInvariant)]
    private static partial Regex ConfigPattern();
}
