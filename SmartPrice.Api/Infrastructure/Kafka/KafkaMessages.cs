namespace SmartPrice.Api.Infrastructure.Kafka;

public record ParseRequest(int ItemId, string Url, string Store);

public record PriceResult(int ItemId, decimal Price, bool IsAvailable, DateTime ParsedAt);
