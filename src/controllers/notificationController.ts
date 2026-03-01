// src/controllers/notificationController.ts
import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { isExpoPushToken } from '../utils/expoPush';

// ─── GET /notifications ──────────────────────────────────────────

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { page = 1, limit = 20, unread } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { recipientId: userId };
    if (unread === 'true') where.isRead = false;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
    ]);

    res.json({
      data: notifications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        hasMore: skip + Number(limit) < total,
      },
    });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({
      error: 'Failed to fetch notifications',
      details: err instanceof Error ? err.message : 'Unknown error',
    });
  }
};

// ─── GET /notifications/unread_count ─────────────────────────────

export const getUnreadCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const count = await prisma.notification.count({
      where: { recipientId: userId, isRead: false },
    });

    res.json({ unread_count: count });
  } catch (err) {
    console.error('Error fetching unread count:', err);
    res.status(500).json({
      error: 'Failed to fetch unread count',
      details: err instanceof Error ? err.message : 'Unknown error',
    });
  }
};

// ─── PATCH /notifications/:id/mark-read ──────────────────────────

export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { id } = req.params;

    const notification = await prisma.notification.findFirst({
      where: { id, recipientId: userId },
    });

    if (!notification) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }

    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({
      error: 'Failed to mark notification as read',
      details: err instanceof Error ? err.message : 'Unknown error',
    });
  }
};

// ─── POST /notifications/mark-all-read ───────────────────────────

export const markAllAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const result = await prisma.notification.updateMany({
      where: { recipientId: userId, isRead: false },
      data: { isRead: true },
    });

    res.json({
      message: 'All notifications marked as read',
      updated: result.count,
    });
  } catch (err) {
    console.error('Error marking all notifications as read:', err);
    res.status(500).json({
      error: 'Failed to mark all notifications as read',
      details: err instanceof Error ? err.message : 'Unknown error',
    });
  }
};

// ─── POST /notifications/register ────────────────────────────────
// Register a device push token (Expo Push Token)

export const registerPushToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { token, platform } = req.body;

    if (!token || typeof token !== 'string') {
      res.status(400).json({ error: 'A valid push token is required' });
      return;
    }

    if (!isExpoPushToken(token)) {
      res.status(400).json({ error: 'Invalid Expo push token format' });
      return;
    }

    // Upsert: if the token already exists, update the userId and activate it
    const deviceToken = await prisma.devicePushToken.upsert({
      where: { token },
      update: {
        userId,
        platform: platform ?? null,
        active: true,
      },
      create: {
        userId,
        token,
        platform: platform ?? null,
        active: true,
      },
    });

    res.status(201).json({
      message: 'Push token registered successfully',
      data: { id: deviceToken.id },
    });
  } catch (err) {
    console.error('Error registering push token:', err);
    res.status(500).json({
      error: 'Failed to register push token',
      details: err instanceof Error ? err.message : 'Unknown error',
    });
  }
};

// ─── DELETE /notifications/register ──────────────────────────────
// Unregister (deactivate) a device push token

export const unregisterPushToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { token } = req.body;

    if (!token || typeof token !== 'string') {
      res.status(400).json({ error: 'A valid push token is required' });
      return;
    }

    await prisma.devicePushToken.updateMany({
      where: { token, userId },
      data: { active: false },
    });

    res.json({ message: 'Push token unregistered successfully' });
  } catch (err) {
    console.error('Error unregistering push token:', err);
    res.status(500).json({
      error: 'Failed to unregister push token',
      details: err instanceof Error ? err.message : 'Unknown error',
    });
  }
};
