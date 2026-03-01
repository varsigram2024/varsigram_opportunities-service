// src/routes/index.ts
import { Router } from 'express';
import opportunityRoutes from './opportunities';
import notificationRoutes from './notifications';

const router = Router();

// Mount opportunity routes
router.use('/opportunities', opportunityRoutes);

// Mount notification routes
router.use('/notifications', notificationRoutes);

// API info route
router.get('/', (req, res) => {
  res.json({
    message: 'Opportunities API',
    version: '1.0.0',
    endpoints: {
      opportunities: '/api/v1/opportunities',
      internships: '/api/v1/opportunities/category/internships',
      scholarships: '/api/v1/opportunities/category/scholarships',
      others: '/api/v1/opportunities/category/others',
      search: '/api/v1/opportunities/search?q=keyword',
      notifications: '/api/v1/notifications',
      unreadCount: '/api/v1/notifications/unread_count',
      registerPushToken: '/api/v1/notifications/register'
    }
  });
});

export default router;