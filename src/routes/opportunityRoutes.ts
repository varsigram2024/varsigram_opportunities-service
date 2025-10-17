// src/routes/opportunityRoutes.ts
import { Router } from 'express';
import {
  getAllOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  getInternships,
  getScholarships,
  getOthers,
  searchOpportunities
} from '../controllers/opportunityController';
import { authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import {
  createOpportunitySchema,
  updateOpportunitySchema
} from '../validators/opportunityValidators';

const router = Router();

// Public routes (no auth required)
router.get('/', getAllOpportunities);
router.get('/search', searchOpportunities);
router.get('/internships', getInternships);
router.get('/scholarships', getScholarships);
router.get('/others', getOthers);
router.get('/:id', getOpportunityById);

// Protected routes (auth required)
router.post(
  '/',
  authMiddleware,
  validateRequest(createOpportunitySchema),
  createOpportunity
);

router.put(
  '/:id',
  authMiddleware,
  validateRequest(updateOpportunitySchema),
  updateOpportunity
);

router.delete('/:id', authMiddleware, deleteOpportunity);

export default router;
