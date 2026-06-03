using System.Text.Json;
using StackExchange.Redis;

namespace SmartPrice.Api.Infrastructure.Redis;

public sealed class RedisCacheService(IConnectionMultiplexer redis)
{
    private readonly IDatabase _db = redis.GetDatabase();

    public async Task SetAsync<T>(string key, T value, TimeSpan? expiry = null)
    {
        var json = JsonSerializer.Serialize(value);
        await _db.StringSetAsync(key, json, expiry ?? TimeSpan.FromMinutes(5));
    }

    public async Task<T?> GetAsync<T>(string key)
    {
        var val = await _db.StringGetAsync(key);
        return val.IsNullOrEmpty ? default : JsonSerializer.Deserialize<T>((string)val!);
    }

    public async Task<bool> CheckRateLimitAsync(string key, int maxRequests, TimeSpan window)
    {
        var count = await _db.StringIncrementAsync(key);
        if (count == 1) await _db.KeyExpireAsync(key, window);
        return count <= maxRequests;
    }

    public async Task RemoveAsync(string key) => await _db.KeyDeleteAsync(key);
}
