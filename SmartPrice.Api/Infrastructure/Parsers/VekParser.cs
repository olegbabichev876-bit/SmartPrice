namespace SmartPrice.Api.Infrastructure.Parsers;

/// <summary>Stub parser for 21vek.by</summary>
public sealed class VekParser(ILogger<VekParser> logger) : IStoreParser
{
    private static readonly Random Rng = new();

    public string StoreName => "21vek";

    public Task<ParseResult> ParseAsync(string url, CancellationToken ct = default)
    {
        logger.LogInformation("[STUB] 21vek parsing {Url}", url);
        var price = Math.Round(2900m + (decimal)(Rng.NextDouble() * 350), 0);
        return Task.FromResult(new ParseResult(price, IsAvailable: true));
    }
}
