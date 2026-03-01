# Opportunity Notifications — Implementation Summary

**Date:** March 1, 2026

---

## Overview

Implemented a full notification system for the Opportunities service. When a new opportunity is posted, **every app user** (except the poster) receives both an **in-app notification** and an **Expo push notification**.

---

## What Was Added

### New Files

| File | Purpose |
|------|---------|
| `src/utils/expoPush.ts` | Lightweight Expo Push API client — sends push notifications in batches of 100 via `POST https://exp.host/--/api/v2/push/send`. Includes token format validation. |
| `src/services/notificationService.ts` | Core notification logic — creates in-app `Notification` records in the database and dispatches Expo push notifications to all active device tokens. |
| `src/controllers/notificationController.ts` | REST API handlers for listing, reading, and managing notifications, plus registering/unregistering Expo push tokens. |
| `src/routes/notifications.ts` | Express route definitions for all notification endpoints, all protected by `authMiddleware`. |

### Modified Files

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Added `Notification` model, `DevicePushToken` model, and `NotificationType` enum. |
| `src/routes/index.ts` | Mounted the new `/notifications` routes under `/api/v1/notifications`. |
| `src/controllers/opportunityController.ts` | `createOpportunity` now calls `notifyNewOpportunity()` asynchronously after the opportunity is saved, so the response is not blocked. |

### Database Migration

Migration `20260301174220_add_notifications` was created and applied, adding:

- **`notifications`** table with columns: `id` (UUID), `recipient_id`, `title`, `body`, `type` (enum), `data` (JSONB), `sender` (JSONB), `is_read`, `created_at`
- **`device_push_tokens`** table with columns: `id` (UUID), `user_id`, `token` (unique), `platform`, `active`, `created_at`, `updated_at`
- Indexes on `(recipient_id, is_read)`, `(recipient_id, created_at)`, and `(user_id, active)`

---

## API Endpoints

All notification endpoints require authentication (`Bearer` token).

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/notifications/` | GET | Fetch notification list. Supports `?page=`, `?limit=`, `?unread=true` |
| `/api/v1/notifications/unread_count` | GET | Get unread notification count |
| `/api/v1/notifications/:id/mark-read` | PATCH | Mark a single notification as read |
| `/api/v1/notifications/mark-all-read` | POST | Mark all notifications as read |
| `/api/v1/notifications/register` | POST | Register an Expo push token (`{ "token": "ExponentPushToken[...]", "platform": "ios" }`) |
| `/api/v1/notifications/register` | DELETE | Deactivate a push token (`{ "token": "ExponentPushToken[...]" }`) |

---

## Notification Flow (Opportunity Creation)

```
User creates opportunity via POST /api/v1/opportunities
        │
        ▼
Opportunity saved to DB → 201 response sent immediately
        │
        ▼  (async, non-blocking)
notifyNewOpportunity(opportunity)
        │
        ├──► createBroadcastNotifications()
        │       Creates an in-app Notification record for every user
        │       with a registered device token (excludes the poster)
        │
        └──► sendBroadcastPush()
                Sends Expo push notification to all active device
                tokens (excludes the poster), in batches of 100
```

---

## Push Notification Payload

Matches the spec provided by the mobile team:

```json
{
  "to": "<expo_push_token>",
  "title": "New Opportunity",
  "body": "Org Name posted a new internship: Backend Developer Intern",
  "data": {
    "type": "opportunity",
    "opportunity_id": "<uuid>"
  },
  "sound": "default",
  "badge": 1
}
```

The `data` object contains `type: "opportunity"` and `opportunity_id` so the mobile app can navigate to the correct opportunity detail page on tap.

---

## In-App Notification Record

```json
{
  "id": "<uuid>",
  "recipient_id": 42,
  "title": "New Opportunity",
  "body": "Org Name posted a new internship: Backend Developer Intern",
  "type": "opportunity",
  "data": {
    "type": "opportunity",
    "opportunity_id": "<uuid>"
  },
  "sender": {
    "id": 7
  },
  "is_read": false,
  "created_at": "2026-03-01T12:00:00.000Z"
}
```

---

## Notification Targeting

**Broadcast to all app users.** Every user who has registered at least one active Expo push token receives the notification. The poster is excluded from their own notification.

---

## Supported Notification Types (Enum)

The `NotificationType` enum supports all types required by the mobile app:

| Enum Value | DB Value |
|------------|----------|
| `OPPORTUNITY` | `opportunity` |
| `LIKE` | `like` |
| `COMMENT` | `comment` |
| `REPLY` | `reply` |
| `MENTION` | `mention` |
| `FOLLOW` | `follow` |
| `NEW_POST` | `new_post` |
| `REWARD_POINT` | `reward_point` |

---

## No External Dependencies Added

The Expo Push API is called using the built-in `fetch` API — no additional npm packages were needed. No Django API calls are required; the notification targets all app users directly from the local database.
