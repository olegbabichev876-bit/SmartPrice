namespace SmartPrice.Api.Infrastructure.Parsers;

/// <summary>Stub parser for kufar.by</summary>
public sealed class KufarParser(ILogger<KufarParser> logger) : IStoreParser
{
    private static readonly Random Rng = new();

    public string StoreName => "kufar";

    public Task<ParseResult> ParseAsync(string url, CancellationToken ct = default)
    {
        logger.LogInformation("[STUB] Kufar parsing {Url}", url);
        var price = Math.Round(2650m + (decimal)(Rng.NextDouble() * 500), 0);
        return Task.FromResult(new ParseResult(price, IsAvailable: true));
    }
}
