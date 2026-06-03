using Microsoft.AspNetCore.SignalR;

namespace SmartPrice.Api.Hubs;

/// <summary>
/// SignalR hub for real-time price updates.
/// UI connects and subscribes to specific item groups.
/// </summary>
public sealed class PriceHub : Hub
{
    /// <summary>
    /// UI calls this to start receiving updates for a specific item.
    /// </summary>
    public async Task SubscribeToItem(int itemId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"item-{itemId}");
    }

    /// <summary>
    /// UI calls this to stop receiving updates for a specific item.
    /// </summary>
    public async Task UnsubscribeFromItem(int itemId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"item-{itemId}");
    }

    public override async Task OnConnectedAsync()
    {
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await base.OnDisconnectedAsync(exception);
    }
}
