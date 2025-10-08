import { Request, Response } from "express";
import { 
    createOpportunityService,
    listOpportunitiesService,
    getOpportunityByIdService,
    updateOpportunityService,
    deleteOpportunityService
} from "../services/opportunity.service";

export async function createOpportunities(req: Request, res: Response) {
    try {
        const created = await createOpportunityService(req.body);
        res.status(201).json({ message: "opportunity created successfully", data: created });
        return;
    } catch (e: any) {
        res.status(400).json({ error: e?.message || "Failed to create opportunity" });
        return;
    }
}

export async function listOpportunities(req: Request, res: Response) {
    try {
        const { search, category, location, remote, page, limit, sort } = req.query as Record<string, string>;
        const filters = {
            search: search || undefined,
            category: category || undefined,
            location: location || undefined,
            isRemote: remote === undefined ? undefined : remote === 'true',
            page: page ? Math.max(1, parseInt(page, 10)) : 1,
            limit: limit ? Math.min(100, Math.max(1, parseInt(limit, 10))) : 20,
            sort: sort || 'createdAt:desc',
        };
        const result = await listOpportunitiesService(filters);
        res.status(200).json(result);
        return;
    } catch (e: any) {
        res.status(400).json({ error: e?.message || "Failed to fetch opportunities" });
        return;
    }
}

export async function listInternships(req: Request, res: Response) {
    try {
        const { search, location, remote, page, limit, sort } = req.query as Record<string, string>;
        const result = await listOpportunitiesService({
            search: search || undefined,
            category: 'INTERNSHIP',
            location: location || undefined,
            isRemote: remote === undefined ? undefined : remote === 'true',
            page: page ? Math.max(1, parseInt(page, 10)) : 1,
            limit: limit ? Math.min(100, Math.max(1, parseInt(limit, 10))) : 20,
            sort: sort || 'createdAt:desc',
        });
        res.status(200).json(result);
        return;
    } catch (e: any) {
        res.status(400).json({ error: e?.message || "Failed to fetch internships" });
        return;
    }
}

export async function listScholarships(req: Request, res: Response) {
    try {
        const { search, location, remote, page, limit, sort } = req.query as Record<string, string>;
        const result = await listOpportunitiesService({
            search: search || undefined,
            category: 'SCHOLARSHIP',
            location: location || undefined,
            isRemote: remote === undefined ? undefined : remote === 'true',
            page: page ? Math.max(1, parseInt(page, 10)) : 1,
            limit: limit ? Math.min(100, Math.max(1, parseInt(limit, 10))) : 20,
            sort: sort || 'createdAt:desc',
        });
        res.status(200).json(result);
        return;
    } catch (e: any) {
        res.status(400).json({ error: e?.message || "Failed to fetch scholarships" });
        return;
    }
}

export async function listOthers(req: Request, res: Response) {
    try {
        const { search, location, remote, page, limit, sort } = req.query as Record<string, string>;
        const result = await listOpportunitiesService({
            search: search || undefined,
            category: 'OTHER',
            location: location || undefined,
            isRemote: remote === undefined ? undefined : remote === 'true',
            page: page ? Math.max(1, parseInt(page, 10)) : 1,
            limit: limit ? Math.min(100, Math.max(1, parseInt(limit, 10))) : 20,
            sort: sort || 'createdAt:desc',
        });
        res.status(200).json(result);
        return;
    } catch (e: any) {
        res.status(400).json({ error: e?.message || "Failed to fetch others" });
        return;
    }
}

export async function getOpportunityById(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const found = await getOpportunityByIdService(id);
        if (!found) { res.status(404).json({ error: "Not found" }); return; }
        res.status(200).json({ data: found });
        return;
    } catch (e: any) {
        res.status(400).json({ error: e?.message || "Failed to fetch opportunity" });
        return;
    }
}

export async function updateOpportunity(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const updated = await updateOpportunityService(id, req.body);
        res.status(200).json({ message: "opportunity updated successfully", data: updated });
        return;
    } catch (e: any) {
        if (e?.code === 'NOT_FOUND') { res.status(404).json({ error: "Not found" }); return; }
        res.status(400).json({ error: e?.message || "Failed to update opportunity" });
        return;
    }
}

export async function deleteOpportunity(req: Request, res: Response) {
    try {
        const { id } = req.params;
        await deleteOpportunityService(id);
        res.status(204).send();
        return;
    } catch (e: any) {
        if (e?.code === 'NOT_FOUND') { res.status(404).json({ error: "Not found" }); return; }
        res.status(400).json({ error: e?.message || "Failed to delete opportunity" });
        return;
    }
}


