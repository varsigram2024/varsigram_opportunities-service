import { Router } from "express";
import { listInternships } from "../controllers/opportunityController";

const router = Router();

router.get("/api/v1/internships", listInternships);

export default router;


