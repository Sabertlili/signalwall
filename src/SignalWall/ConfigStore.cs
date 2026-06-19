using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;

namespace SignalWall;

public sealed partial class ConfigStore
{
    private const int MaxConfigurationBytes = 2 * 1024 * 1024;
    private static readonly int[] DefaultScreenOrder = [2, 3, 1];
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

        ValidateConfiguration(config);

        var json = JsonSerializer.Serialize(config, new JsonSerializerOptions
        {
            WriteIndented = true
        });
        if (Encoding.UTF8.GetByteCount(json) > MaxConfigurationBytes)
        {
            throw new InvalidDataException("SignalWall configuration is larger than 2 MB.");
        }

        var temporaryPath = $"{configPath}.tmp";
        File.WriteAllText(
            temporaryPath,
            $"window.QUOTE_SIGNAL_CONFIG = {json};{Environment.NewLine}",
            new UTF8Encoding(false));
        File.Move(temporaryPath, configPath, true);
    }

    public IReadOnlyList<int> ReadScreenOrder()
    {
        try
        {
            var order = Read()["defaults"]?["screenOrder"]?.AsArray()
                .Select(item => item?.GetValue<int>() ?? 0)
                .Where(item => item is >= 1 and <= 3)
                .Distinct()
                .ToList() ?? [];

            foreach (var fallback in DefaultScreenOrder)
            {
                if (!order.Contains(fallback))
                {
                    order.Add(fallback);
                }
            }

            return order.Take(3).ToArray();
        }
        catch (Exception exception) when (
            exception is IOException or
            InvalidDataException or
            JsonException or
            InvalidOperationException)
        {
            return DefaultScreenOrder;
        }
    }

    private static void ValidateConfiguration(JsonElement config)
    {
        RequireObject(config, "defaults");
        RequireNonEmptyArray(config, "textThemes");
        RequireNonEmptyArray(config, "colorThemes");

        foreach (var theme in config.GetProperty("textThemes").EnumerateArray())
        {
            if (theme.ValueKind != JsonValueKind.Object)
            {
                throw new InvalidDataException("Every text theme must be an object.");
            }

            RequireNonEmptyArray(theme, "quotes");
        }
    }

    private static void RequireObject(JsonElement parent, string propertyName)
    {
        if (!parent.TryGetProperty(propertyName, out var property) ||
            property.ValueKind != JsonValueKind.Object)
        {
            throw new InvalidDataException($"SignalWall configuration requires an object named '{propertyName}'.");
        }
    }

    private static void RequireNonEmptyArray(JsonElement parent, string propertyName)
    {
        if (!parent.TryGetProperty(propertyName, out var property) ||
            property.ValueKind != JsonValueKind.Array ||
            property.GetArrayLength() == 0)
        {
            throw new InvalidDataException($"SignalWall configuration requires a non-empty array named '{propertyName}'.");
        }
    }

    [GeneratedRegex(
        @"window\.QUOTE_SIGNAL_CONFIG\s*=\s*(?<json>\{[\s\S]*\})\s*;?\s*$",
        RegexOptions.CultureInvariant)]
    private static partial Regex ConfigPattern();
}
