import {
  HubConnectionBuilder,
  HttpTransportType,
  LogLevel,
  type HubConnection,
} from '@microsoft/signalr'

export function buildNotificationHubUrl(): string {
  const configuredUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    'http://localhost:7070'
  const normalized = configuredUrl.replace(/\/+$/, '').replace(/\/api$/i, '')
  return `${normalized}/hubs/notifications`
}

export function createNotificationHubConnection(
  accessTokenFactory: () => string | Promise<string>
): HubConnection {
  return new HubConnectionBuilder()
    .withUrl(buildNotificationHubUrl(), {
      accessTokenFactory,
      transport: HttpTransportType.WebSockets | HttpTransportType.ServerSentEvents,
    })
    .withAutomaticReconnect([0, 2_000, 5_000, 10_000])
    .configureLogging(LogLevel.Warning)
    .build()
}
