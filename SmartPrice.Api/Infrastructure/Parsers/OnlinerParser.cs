namespace SmartPrice.Api.Infrastructure.Parsers;

/// <summary>
/// Stub parser — returns a random price within a realistic range.
/// Replace the body with real HTTP + HtmlAgilityPack scraping when ready.
/// </summary>
public sealed class OnlinerParser(ILogger<OnlinerParser> logger) : IStoreParser
{
    private static readonly Random Rng = new();

    public string StoreName => "onliner";

    public Task<ParseResult> ParseAsync(string url, CancellationToken ct = default)
    {
        logger.LogInformation("[STUB] Onliner parsing {Url}", url);
        var price = Math.Round(2800m + (decimal)(Rng.NextDouble() * 400), 0);
        return Task.FromResult(new ParseResult(price, IsAvailable: true));
    }
}
