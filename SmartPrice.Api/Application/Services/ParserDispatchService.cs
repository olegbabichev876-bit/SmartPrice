using Microsoft.EntityFrameworkCore;
using SmartPrice.Api.Infrastructure.Kafka;
using SmartPrice.Api.Infrastructure.Parsers;
using SmartPrice.Api.Infrastructure.Persistence;
using SmartPrice.Api.Infrastructure.Redis;

namespace SmartPrice.Api.Application.Services;

/// <summary>
/// Fetches all active tracked items, runs their store parsers,
/// then publishes results to Kafka price.results topic.
/// Called by the Quartz scheduler.
/// </summary>
public sealed class ParserDispatchService(
    AppDbContext db,
    IEnumerable<IStoreParser> parsers,
    KafkaProducer kafka,
    RedisCacheService cache,
    ILogger<ParserDispatchService> logger)
{
    private readonly Dictionary<string, IStoreParser> _parsers =
        parsers.ToDictionary(p => p.StoreName, StringComparer.OrdinalIgnoreCase);

    public async Task RunAsync(CancellationToken ct = default)
    {
        var items = await db.TrackedItems
            .Where(x => x.IsActive)
            .ToListAsync(ct);

        logger.LogInformation("Dispatching parse for {Count} items", items.Count);

        var tasks = items.Select(async item =>
        {
            // Rate-limit: 1 parse per item per 10 minutes max
            var rateLimitKey = $"parse:rl:{item.Id}";
            var allowed = await cache.CheckRateLimitAsync(rateLimitKey, 1, TimeSpan.FromMinutes(10));
            if (!allowed)
            {
                logger.LogDebug("Rate-limited item {Id}", item.Id);
                return;
            }

            var store = item.Store.ToString().Replace("VekDvadtsetOdin", "21vek").ToLower();
            if (!_parsers.TryGetValue(store, out var parser))
            {
                logger.LogWarning("No parser for store {Store}", store);
                return;
            }

            try
            {
                var result = await parser.ParseAsync(item.Url, ct);
                if (result.Error is not null)
                {
                    logger.LogWarning("Parse error for item {Id}: {Error}", item.Id, result.Error);
                    return;
                }

                await kafka.PublishAsync(
                    KafkaTopics.PriceResults,
                    item.Id.ToString(),
                    new PriceResult(item.Id, result.Price, result.IsAvailable, DateTime.UtcNow));
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to parse item {Id}", item.Id);
            }
        });

        await Task.WhenAll(tasks);
    }
}
