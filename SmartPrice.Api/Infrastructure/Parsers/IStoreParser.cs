namespace SmartPrice.Api.Infrastructure.Parsers;

public interface IStoreParser
{
    string StoreName { get; }
    Task<ParseResult> ParseAsync(string url, CancellationToken ct = default);
}

public record ParseResult(decimal Price, bool IsAvailable, string? Error = null);
