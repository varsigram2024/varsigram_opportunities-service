// src/services/notificationService.ts
import prisma from '../utils/prisma';
import { Prisma } from '@prisma/client';
import {
  sendExpoPushNotifications,
  isExpoPushToken,
  type ExpoPushMessage,
} from '../utils/expoPush';
import type { Opportunity } from '@prisma/client';

// ─── Types ───────────────────────────────────────────────────────

export interface NotificationPayload {
  title: string;
  body: string;
  type: string;
  data: Record<string, unknown>;
  sender?: {
    id: number;
    username?: string;
    profile_pic_url?: string | null;
  } | null;
}

// ─── Core helpers ────────────────────────────────────────────────

/**
 * Create in-app notification records for every user who has a
 * registered device token (i.e. everyone with the app installed).
 * Optionally exclude a specific user (e.g. the poster).
 */
export async function createBroadcastNotifications(
  payload: NotificationPayload,
  excludeUserId?: number
): Promise<number> {
  // Get all distinct user IDs that have at least one active push token
  const tokens = await prisma.devicePushToken.findMany({
    where: { active: true },
    select: { userId: true },
    distinct: ['userId'],
  });

  const recipientIds = tokens
    .map((t) => t.userId)
    .filter((uid) => uid !== excludeUserId);

  if (recipientIds.length === 0) return 0;

  const records = recipientIds.map((recipientId) => ({
    recipientId,
    title: payload.title,
    body: payload.body,
    type: mapNotificationType(payload.type),
    data: payload.data as Prisma.InputJsonValue,
    sender: (payload.sender ?? Prisma.DbNull) as Prisma.InputJsonValue,
  }));

  const result = await prisma.notification.createMany({ data: records });
  return result.count;
}

/**
 * Send Expo push notifications to ALL active device tokens.
 * Optionally exclude a specific user (e.g. the poster).
 */
export async function sendBroadcastPush(
  payload: NotificationPayload,
  excludeUserId?: number
): Promise<void> {
  const where: any = { active: true };
  if (excludeUserId !== undefined) {
    where.userId = { not: excludeUserId };
  }

  const deviceTokens = await prisma.devicePushToken.findMany({
    where,
    select: { token: true },
  });

  const messages: ExpoPushMessage[] = deviceTokens
    .filter((dt) => isExpoPushToken(dt.token))
    .map((dt) => ({
      to: dt.token,
      title: payload.title,
      body: payload.body,
      data: payload.data,
      sound: 'default' as const,
      badge: 1,
    }));

  if (messages.length === 0) return;

  try {
    const tickets = await sendExpoPushNotifications(messages);
    const errors = tickets.filter((t) => t.status === 'error');
    if (errors.length > 0) {
      console.warn(
        `${errors.length}/${tickets.length} push notifications failed:`,
        errors
      );
    } else {
      console.log(`✅ Sent ${tickets.length} push notifications`);
    }
  } catch (err) {
    console.error('Push notification send failed:', err);
  }
}

/**
 * Broadcast: create in-app records AND send push to everyone.
 */
export async function broadcastNotification(
  payload: NotificationPayload,
  excludeUserId?: number
): Promise<void> {
  await Promise.allSettled([
    createBroadcastNotifications(payload, excludeUserId),
    sendBroadcastPush(payload, excludeUserId),
  ]);
}

// ─── Opportunity-specific logic ──────────────────────────────────

/**
 * Called after a new opportunity is created.
 * Broadcasts a notification to every app user (except the poster).
 */
export async function notifyNewOpportunity(
  opportunity: Opportunity
): Promise<void> {
  const { id, title, category, organization, createdBy } = opportunity;

  const categoryLabel = formatCategory(category);

  const payload: NotificationPayload = {
    title: 'New Opportunity',
    body: `${organization ?? 'An organization'} posted a new ${categoryLabel}: ${title}`,
    type: 'opportunity',
    data: {
      type: 'opportunity',
      opportunity_id: id,
    },
    sender: {
      id: createdBy,
    },
  };

  console.log(`📣 Broadcasting notification for new opportunity "${title}"`);

  await broadcastNotification(payload, createdBy);
}

// ─── Helpers ─────────────────────────────────────────────────────

function formatCategory(cat: string): string {
  const map: Record<string, string> = {
    INTERNSHIP: 'internship',
    SCHOLARSHIP: 'scholarship',
    COMPETITION: 'competition',
    GIG: 'gig',
    PITCH: 'pitch',
    OTHER: 'opportunity',
  };
  return map[cat] ?? 'opportunity';
}

/**
 * Map a lowercase notification type string to the Prisma enum value.
 */
function mapNotificationType(type: string): any {
  const map: Record<string, string> = {
    opportunity: 'OPPORTUNITY',
    like: 'LIKE',
    comment: 'COMMENT',
    reply: 'REPLY',
    mention: 'MENTION',
    follow: 'FOLLOW',
    new_post: 'NEW_POST',
    reward_point: 'REWARD_POINT',
  };
  return map[type] ?? 'OPPORTUNITY';
}
