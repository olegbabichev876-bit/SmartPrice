using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using SmartPrice.Api.Domain.Entities;
using SmartPrice.Api.Hubs;
using SmartPrice.Api.Infrastructure.Kafka;
using SmartPrice.Api.Infrastructure.Persistence;

namespace SmartPrice.Api.Application.Services;

/// <summary>
/// Consumes PriceResult from Kafka, detects price changes,
/// persists snapshots and pushes live updates via SignalR.
/// </summary>
public sealed class IngestorService(
    AppDbContext db,
    IHubContext<PriceHub> hub,
    ILogger<IngestorService> logger)
{
    public async Task IngestAsync(PriceResult result, CancellationToken ct)
    {
        var item = await db.TrackedItems
            .Include(x => x.Snapshots.OrderByDescending(s => s.RecordedAt).Take(1))
            .FirstOrDefaultAsync(x => x.Id == result.ItemId, ct);

        if (item is null)
        {
            logger.LogWarning("TrackedItem {Id} not found — skipping", result.ItemId);
            return;
        }

        var lastPrice = item.Snapshots.FirstOrDefault()?.Price;
        var priceChanged = lastPrice is null || lastPrice != result.Price;

        if (!priceChanged)
        {
            logger.LogDebug("Price unchanged for item {Id}: {Price}", result.ItemId, result.Price);
            return;
        }

        var snapshot = new PriceSnapshot
        {
            TrackedItemId = result.ItemId,
            Price         = result.Price,
            IsAvailable   = result.IsAvailable,
            RecordedAt    = result.ParsedAt
        };
        db.PriceSnapshots.Add(snapshot);
        await db.SaveChangesAsync(ct);

        logger.LogInformation("Price change: item {Id} {Old} → {New}", result.ItemId, lastPrice, result.Price);

        // Push live update to all UI clients watching this item
        await hub.Clients.Group($"item-{result.ItemId}").SendAsync(
            "PriceUpdated",
            new { result.ItemId, result.Price, result.IsAvailable, result.ParsedAt },
            ct);

        // Check target reached
        if (result.Price <= item.TargetPrice)
        {
            await hub.Clients.Group($"item-{result.ItemId}").SendAsync(
                "TargetReached",
                new { result.ItemId, result.Price, item.TargetPrice },
                ct);
            logger.LogInformation("Target reached for item {Id}! Price={Price} Target={Target}",
                result.ItemId, result.Price, item.TargetPrice);
        }
    }
}
