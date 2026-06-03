using System.Text.Json;
using Confluent.Kafka;
using SmartPrice.Api.Application.Services;

namespace SmartPrice.Api.Infrastructure.Kafka;

public sealed class PriceResultsConsumer(
    IConfiguration config,
    IServiceScopeFactory scopeFactory,
    ILogger<PriceResultsConsumer> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        var cfg = new ConsumerConfig
        {
            BootstrapServers = config["Kafka:BootstrapServers"] ?? "localhost:9092",
            GroupId          = "price-ingestor",
            AutoOffsetReset  = AutoOffsetReset.Earliest,
            EnableAutoCommit = false
        };

        using var consumer = new ConsumerBuilder<string, string>(cfg).Build();
        consumer.Subscribe(KafkaTopics.PriceResults);
        logger.LogInformation("PriceResultsConsumer started");

        while (!ct.IsCancellationRequested)
        {
            try
            {
                var result = consumer.Consume(TimeSpan.FromSeconds(1));
                if (result is null) continue;

                var msg = JsonSerializer.Deserialize<PriceResult>(result.Message.Value);
                if (msg is null) continue;

                await using var scope = scopeFactory.CreateAsyncScope();
                var ingestor = scope.ServiceProvider.GetRequiredService<IngestorService>();
                await ingestor.IngestAsync(msg, ct);

                consumer.Commit(result);
            }
            catch (OperationCanceledException) { break; }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error consuming price.results");
                await Task.Delay(2000, ct);
            }
        }

        consumer.Close();
    }
}
