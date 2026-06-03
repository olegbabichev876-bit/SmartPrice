using Microsoft.EntityFrameworkCore;
using SmartPrice.Api.Domain.Entities;

namespace SmartPrice.Api.Infrastructure.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<TrackedItem> TrackedItems => Set<TrackedItem>();
    public DbSet<PriceSnapshot> PriceSnapshots => Set<PriceSnapshot>();

    protected override void OnModelCreating(ModelBuilder mb)
    {
        mb.Entity<TrackedItem>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Title).HasMaxLength(300).IsRequired();
            e.Property(x => x.Url).HasMaxLength(500).IsRequired();
            e.Property(x => x.TargetPrice).HasPrecision(18, 2);
            e.Property(x => x.Store).HasConversion<string>();
        });

        mb.Entity<PriceSnapshot>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Price).HasPrecision(18, 2);
            e.HasIndex(x => new { x.TrackedItemId, x.RecordedAt });
            e.HasOne(x => x.TrackedItem)
             .WithMany(x => x.Snapshots)
             .HasForeignKey(x => x.TrackedItemId)
             .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
