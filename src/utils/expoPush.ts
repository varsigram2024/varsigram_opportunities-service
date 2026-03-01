// src/utils/expoPush.ts
// Lightweight Expo Push API client — no external SDK required.

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

export interface ExpoPushMessage {
  to: string;            // Expo push token
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: 'default' | null;
  badge?: number;
  channelId?: string;
}

export interface ExpoPushTicket {
  status: 'ok' | 'error';
  id?: string;
  message?: string;
  details?: Record<string, unknown>;
}

/**
 * Send push notifications via Expo Push API.
 * Messages are sent in batches of 100 (Expo's recommended limit).
 */
export async function sendExpoPushNotifications(
  messages: ExpoPushMessage[]
): Promise<ExpoPushTicket[]> {
  if (messages.length === 0) return [];

  const BATCH_SIZE = 100;
  const tickets: ExpoPushTicket[] = [];

  for (let i = 0; i < messages.length; i += BATCH_SIZE) {
    const batch = messages.slice(i, i + BATCH_SIZE);

    try {
      const response = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(batch),
      });

      if (!response.ok) {
        console.error(
          `Expo Push API responded with ${response.status}: ${response.statusText}`
        );
        continue;
      }

      const result = await response.json() as { data: ExpoPushTicket[] };
      tickets.push(...result.data);
    } catch (err) {
      console.error('Failed to send Expo push notification batch:', err);
    }
  }

  return tickets;
}

/**
 * Validate an Expo push token format.
 */
export function isExpoPushToken(token: string): boolean {
  return /^Expo(nent)?PushToken\[.+\]$/.test(token) || /^[a-zA-Z0-9-_]+$/.test(token);
}
