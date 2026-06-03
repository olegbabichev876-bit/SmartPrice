namespace SmartPrice.Api.Domain.Entities;

public class PriceSnapshot
{
    public long Id { get; set; }
    public int TrackedItemId { get; set; }
    public decimal Price { get; set; }
    public DateTime RecordedAt { get; set; } = DateTime.UtcNow;
    public bool IsAvailable { get; set; } = true;

    public TrackedItem TrackedItem { get; set; } = null!;
}
