import * as signalR from "@microsoft/signalr";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

let connection: signalR.HubConnection | null = null;

export function getPriceHub(): signalR.HubConnection {
  if (!connection) {
    connection = new signalR.HubConnectionBuilder()
      .withUrl(`${BASE}/hubs/price`)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();
  }
  return connection;
}

export async function startHub(): Promise<signalR.HubConnection> {
  const hub = getPriceHub();
  if (hub.state === signalR.HubConnectionState.Disconnected) {
    await hub.start();
    console.log("[SignalR] Connected");
  }
  return hub;
}

export async function subscribeToItem(itemId: number) {
  const hub = await startHub();
  await hub.invoke("SubscribeToItem", itemId);
}

export async function unsubscribeFromItem(itemId: number) {
  const hub = getPriceHub();
  if (hub.state === signalR.HubConnectionState.Connected) {
    await hub.invoke("UnsubscribeFromItem", itemId);
  }
}
