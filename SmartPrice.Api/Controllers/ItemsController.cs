using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartPrice.Api.Domain.Entities;
using SmartPrice.Api.Domain.Enums;
using SmartPrice.Api.Infrastructure.Persistence;

namespace SmartPrice.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class ItemsController(AppDbContext db) : ControllerBase
{
    // GET /api/items
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var items = await db.TrackedItems
            .Where(x => x.IsActive)
            .Select(x => new
            {
                x.Id, x.Title, x.Sub, x.Url, x.TargetPrice,
                store = x.Store.ToString().Replace("VekDvadtsetOdin", "21vek").ToLower(),
                x.CreatedAt,
                currentPrice = x.Snapshots
                    .OrderByDescending(s => s.RecordedAt)
                    .Select(s => (decimal?)s.Price)
                    .FirstOrDefault()
            })
            .ToListAsync();

        return Ok(items);
    }

    // GET /api/items/{id}/history?days=90
    [HttpGet("{id:int}/history")]
    public async Task<IActionResult> GetHistory(int id, [FromQuery] int days = 90)
    {
        var cutoff = DateTime.UtcNow.AddDays(-days);
        var snapshots = await db.PriceSnapshots
            .Where(s => s.TrackedItemId == id && s.RecordedAt >= cutoff)
            .OrderBy(s => s.RecordedAt)
            .Select(s => new { t = ((DateTimeOffset)s.RecordedAt).ToUnixTimeMilliseconds(), s.Price })
            .ToListAsync();

        return Ok(snapshots);
    }

    // POST /api/items
    [HttpPost]
    public async Task<IActionResult> Add([FromBody] AddItemRequest req)
    {
        var store = req.Url switch
        {
            var u when u.Contains("21vek")  => StoreType.VekDvadtsetOdin,
            var u when u.Contains("kufar")  => StoreType.Kufar,
            _                               => StoreType.Onliner
        };

        var item = new TrackedItem
        {
            Store       = store,
            Title       = req.Title,
            Sub         = req.Sub ?? string.Empty,
            Url         = req.Url,
            TargetPrice = req.TargetPrice
        };

        db.TrackedItems.Add(item);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = item.Id }, item);
    }

    // DELETE /api/items/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Remove(int id)
    {
        var item = await db.TrackedItems.FindAsync(id);
        if (item is null) return NotFound();
        item.IsActive = false;
        await db.SaveChangesAsync();
        return NoContent();
    }
}

public record AddItemRequest(string Url, string Title, string? Sub, decimal TargetPrice);
