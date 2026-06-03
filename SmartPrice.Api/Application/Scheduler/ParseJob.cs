using Quartz;
using SmartPrice.Api.Application.Services;

namespace SmartPrice.Api.Application.Scheduler;

[DisallowConcurrentExecution]
public sealed class ParseJob(ParserDispatchService dispatcher, ILogger<ParseJob> logger) : IJob
{
    public static readonly JobKey Key = new("parse-job", "price-tracker");

    public async Task Execute(IJobExecutionContext context)
    {
        logger.LogInformation("ParseJob started at {Time}", DateTimeOffset.UtcNow);
        await dispatcher.RunAsync(context.CancellationToken);
        logger.LogInformation("ParseJob completed");
    }
}
