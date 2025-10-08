import { Router } from "express";
import { listScholarships } from "../controllers/opportunityController";

const router = Router();

router.get("/api/v1/scholarships", listScholarships);

export default router;


