// src/routes/opportunities.ts
import { Router } from 'express';
import * as opportunityController from '../controllers/opportunityController';
import { authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import {
  createOpportunitySchema,
  updateOpportunitySchema
} from '../validators/opportunityValidators';

const router = Router();

// Public routes - No auth required (anyone can view)
router.get('/', opportunityController.getAllOpportunities);
router.get('/search', opportunityController.searchOpportunities);
router.get('/category/internships', opportunityController.getInternships);
router.get('/category/scholarships', opportunityController.getScholarships);
router.get('/category/others', opportunityController.getOthers);
router.get('/:id', opportunityController.getOpportunityById);

// Protected routes - Auth required (only logged-in users can create/edit/delete)
router.post(
  '/',
  authMiddleware,
  validateRequest(createOpportunitySchema),
  opportunityController.createOpportunity
);

router.put(
  '/:id',
  authMiddleware,
  validateRequest(updateOpportunitySchema),
  opportunityController.updateOpportunity
);

router.delete('/:id', authMiddleware, opportunityController.deleteOpportunity);

export default router;

