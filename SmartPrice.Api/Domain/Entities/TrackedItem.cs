using SmartPrice.Api.Domain.Enums;

namespace SmartPrice.Api.Domain.Entities;

public class TrackedItem
{
    public int Id { get; set; }
    public StoreType Store { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Sub { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public decimal TargetPrice { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;

    public ICollection<PriceSnapshot> Snapshots { get; set; } = [];
}
