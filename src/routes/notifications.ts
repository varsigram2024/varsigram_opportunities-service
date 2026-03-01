// src/routes/notifications.ts
import { Router } from 'express';
import * as notificationController from '../controllers/notificationController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All notification routes require authentication
router.use(authMiddleware);

// GET  /notifications              — list notifications (supports ?unread=true&page=1&limit=20)
router.get('/', notificationController.getNotifications);

// GET  /notifications/unread_count — get unread notification count
router.get('/unread_count', notificationController.getUnreadCount);

// POST /notifications/mark-all-read — mark all notifications as read
router.post('/mark-all-read', notificationController.markAllAsRead);

// PATCH /notifications/:id/mark-read — mark single notification as read
router.patch('/:id/mark-read', notificationController.markAsRead);

// POST   /notifications/register — register an Expo push token
router.post('/register', notificationController.registerPushToken);

// DELETE /notifications/register — unregister (deactivate) an Expo push token
router.delete('/register', notificationController.unregisterPushToken);

export default router;
