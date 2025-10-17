// src/routes/index.ts
import { Router } from 'express';
import opportunityRoutes from './opportunities';

const router = Router();

// Mount opportunity routes
router.use('/opportunities', opportunityRoutes);

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
      search: '/api/v1/opportunities/search?q=keyword'
    }
  });
});

export default router;