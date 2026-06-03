using Microsoft.EntityFrameworkCore;
using Quartz;
using StackExchange.Redis;
using SmartPrice.Api.Application.Scheduler;
using SmartPrice.Api.Application.Services;
using SmartPrice.Api.Hubs;
using SmartPrice.Api.Infrastructure.Kafka;
using SmartPrice.Api.Infrastructure.Parsers;
using SmartPrice.Api.Infrastructure.Persistence;
using SmartPrice.Api.Infrastructure.Redis;

var builder = WebApplication.CreateBuilder(args);
var cfg = builder.Configuration;

// ── Database ────────────────────────────────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseNpgsql(cfg.GetConnectionString("Postgres")));

// ── Redis ────────────────────────────────────────────────────────────────────
builder.Services.AddSingleton<IConnectionMultiplexer>(
    ConnectionMultiplexer.Connect(cfg["Redis:ConnectionString"] ?? "localhost:6379"));
builder.Services.AddScoped<RedisCacheService>();

// ── Kafka ────────────────────────────────────────────────────────────────────
builder.Services.AddSingleton<KafkaProducer>();
builder.Services.AddHostedService<PriceResultsConsumer>();

// ── Parsers ──────────────────────────────────────────────────────────────────
builder.Services.AddScoped<IStoreParser, OnlinerParser>();
builder.Services.AddScoped<IStoreParser, VekParser>();
builder.Services.AddScoped<IStoreParser, KufarParser>();

// ── Application services ─────────────────────────────────────────────────────
builder.Services.AddScoped<ParserDispatchService>();
builder.Services.AddScoped<IngestorService>();

// ── Quartz scheduler ─────────────────────────────────────────────────────────
builder.Services.AddQuartz(q =>
{
    q.AddJob<ParseJob>(ParseJob.Key, j => j.StoreDurably());
    q.AddTrigger(t => t
        .ForJob(ParseJob.Key)
        .WithIdentity("parse-trigger")
        .WithCronSchedule(cfg["Scheduler:ParseCron"] ?? "0 */15 * * * ?") // every 15 min
        .StartNow());
});
builder.Services.AddQuartzHostedService(opt => opt.WaitForJobsToComplete = true);

// ── SignalR ───────────────────────────────────────────────────────────────────
builder.Services.AddSignalR();

// ── Web ───────────────────────────────────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddCors(opt => opt.AddDefaultPolicy(p =>
    p.WithOrigins(cfg["Cors:AllowedOrigin"] ?? "http://localhost:5173")
     .AllowAnyHeader()
     .AllowAnyMethod()
     .AllowCredentials())); // required for SignalR

var app = builder.Build();

// ── Auto-migrate on startup ────────────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var dbCtx = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await dbCtx.Database.MigrateAsync();
    await DbSeeder.SeedAsync(dbCtx);
}

// ── Pipeline ──────────────────────────────────────────────────────────────────
if (app.Environment.IsDevelopment())
    app.MapOpenApi();

app.UseCors();
app.UseAuthorization();
app.MapControllers();
app.MapHub<PriceHub>("/hubs/price");

app.Run();
