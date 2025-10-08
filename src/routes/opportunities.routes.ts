import { Router } from "express";
import { createOpportunities, listOpportunities, getOpportunityById, updateOpportunity, deleteOpportunity, listInternships, listScholarships, listOthers } from "../controllers/opportunityController";
import { validateRequest } from "../middleware/validateRequest";
import { createOpportunityValidator, updateOpportunityValidator } from "../types/opportunity.schemas";

const router = Router();

router.post("/api/v1/opportunities", validateRequest(createOpportunityValidator), createOpportunities);
router.get("/api/v1/opportunities", listOpportunities);
router.get("/api/v1/opportunities/:id", getOpportunityById);
router.patch("/api/v1/opportunities/:id", validateRequest(updateOpportunityValidator), updateOpportunity);
router.delete("/api/v1/opportunities/:id", deleteOpportunity);

// Mirror lead engineer category routes
router.get("/api/v1/opportunities/category/internships", listInternships);
router.get("/api/v1/opportunities/category/schollarships", listScholarships); // keep spelling per lead
router.get("/api/v1/opportunities/category/others", listOthers);

export default router;


