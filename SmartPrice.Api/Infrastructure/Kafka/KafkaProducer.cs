using System.Text.Json;
using Confluent.Kafka;

namespace SmartPrice.Api.Infrastructure.Kafka;

public sealed class KafkaProducer : IDisposable
{
    private readonly IProducer<string, string> _producer;
    private readonly ILogger<KafkaProducer> _logger;

    public KafkaProducer(IConfiguration config, ILogger<KafkaProducer> logger)
    {
        _logger = logger;
        var cfg = new ProducerConfig
        {
            BootstrapServers = config["Kafka:BootstrapServers"] ?? "localhost:9092"
        };
        _producer = new ProducerBuilder<string, string>(cfg).Build();
    }

    public async Task PublishAsync<T>(string topic, string key, T message)
    {
        var json = JsonSerializer.Serialize(message);
        try
        {
            await _producer.ProduceAsync(topic, new Message<string, string>
            {
                Key   = key,
                Value = json
            });
            _logger.LogDebug("Published to {Topic}: {Key}", topic, key);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Kafka publish failed for topic {Topic}", topic);
            throw;
        }
    }

    public void Dispose() => _producer.Dispose();
}
