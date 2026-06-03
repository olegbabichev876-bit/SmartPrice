using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartPrice.Api.Infrastructure.Persistence;

namespace SmartPrice.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class ComparisonController(AppDbContext db) : ControllerBase
{
    // GET /api/comparison?title=Samsung Galaxy S24&days=90
    [HttpGet]
    public async Task<IActionResult> Compare([FromQuery] string title, [FromQuery] int days = 90)
    {
        var cutoff = DateTime.UtcNow.AddDays(-days);

        var items = await db.TrackedItems
            .Where(x => x.IsActive && EF.Functions.ILike(x.Title, $"%{title}%"))
            .Include(x => x.Snapshots.Where(s => s.RecordedAt >= cutoff).OrderBy(s => s.RecordedAt))
            .ToListAsync();

        var result = items.Select(item =>
        {
            var prices = item.Snapshots.Select(s => s.Price).ToList();
            return new
            {
                item.Id,
                item.Title,
                item.Sub,
                store = item.Store.ToString().Replace("VekDvadtsetOdin", "21vek").ToLower(),
                item.Url,
                item.TargetPrice,
                current = prices.LastOrDefault(),
                min     = prices.Any() ? prices.Min() : (decimal?)null,
                max     = prices.Any() ? prices.Max() : (decimal?)null,
                history = item.Snapshots.Select(s => new
                {
                    t     = ((DateTimeOffset)s.RecordedAt).ToUnixTimeMilliseconds(),
                    price = s.Price
                })
            };
        });

        return Ok(result);
    }
}
