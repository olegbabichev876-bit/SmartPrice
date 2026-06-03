using SmartPrice.Api.Domain.Entities;
using SmartPrice.Api.Domain.Enums;

namespace SmartPrice.Api.Infrastructure.Persistence;

public static class DbSeeder
{
    private static readonly Random Rng = new(42);

    public static async Task SeedAsync(AppDbContext db)
    {
        if (db.TrackedItems.Any()) return; // уже засеяно

        var items = new List<TrackedItem>
        {
            new() { Store = StoreType.Onliner,          Title = "Samsung Galaxy S24 128GB",      Sub = "Onyx Black",  Url = "catalog.onliner.by/mobile/samsung/galaxys24",    TargetPrice = 2500 },
            new() { Store = StoreType.VekDvadtsetOdin,  Title = "Робот-пылесос Roborock Q7 Max", Sub = "белый",        Url = "21vek.by/robot_vacuums/roborock-q7-max",         TargetPrice = 1150 },
            new() { Store = StoreType.Kufar,            Title = "Велосипед Stels Navigator 700",  Sub = "27.5\", б/у", Url = "kufar.by/item/stels-navigator-700",              TargetPrice = 700  },
            new() { Store = StoreType.VekDvadtsetOdin,  Title = "Samsung Galaxy S24 128GB",      Sub = "Lavender",    Url = "21vek.by/mobile/samsung-galaxy-s24",             TargetPrice = 2500 },
            new() { Store = StoreType.Kufar,            Title = "Samsung Galaxy S24 128GB",      Sub = "Onyx Black, б/у", Url = "kufar.by/item/samsung-galaxy-s24",           TargetPrice = 2300 },
        };

        db.TrackedItems.AddRange(items);
        await db.SaveChangesAsync();

        // Генерируем историю цен за 120 дней
        var snapshots = new List<PriceSnapshot>();
        var configs = new (int idx, decimal start, int days)[]
        {
            (0, 2999, 120), (1, 1499, 120), (2, 899, 120), (3, 3099, 120), (4, 2750, 120)
        };

        foreach (var (idx, start, days) in configs)
        {
            var series = MakeSeries(items[idx].Id, start, days);
            snapshots.AddRange(series);
        }

        db.PriceSnapshots.AddRange(snapshots);
        await db.SaveChangesAsync();
    }

    private static List<PriceSnapshot> MakeSeries(int itemId, decimal start, int days)
    {
        var result = new List<PriceSnapshot>();
        var price = start;
        var now = DateTime.UtcNow;

        for (int i = days; i >= 0; i--)
        {
            var roll = Rng.NextDouble();
            if (roll < 0.07)       price *= (decimal)(1 - (0.03 + Rng.NextDouble() * 0.09));
            else if (roll < 0.11)  price *= (decimal)(1 + (0.02 + Rng.NextDouble() * 0.05));
            else                   price += (decimal)((Rng.NextDouble() - 0.5) * (double)start * 0.008);

            price = Math.Min(Math.Max(price, start * 0.62m), start * 1.08m);
            price = Math.Round(price / 10) * 10;

            result.Add(new PriceSnapshot
            {
                TrackedItemId = itemId,
                Price         = price,
                IsAvailable   = true,
                RecordedAt    = now.AddDays(-i)
            });
        }
        return result;
    }
}
