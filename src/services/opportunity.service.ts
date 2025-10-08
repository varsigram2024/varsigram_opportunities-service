import { CreateOpportunityInput, createOpportunityRepository, listOpportunitiesRepository, getOpportunityByIdRepository, updateOpportunityRepository, deleteOpportunityRepository, listWithFiltersRepository, ListFilters } from "../repositories/opportunity.repository";

export async function createOpportunityService(input: CreateOpportunityInput) {
    return createOpportunityRepository(input);
}

// Listing with filters; controllers should call this variant

export async function getOpportunityByIdService(id: string) {
    return getOpportunityByIdRepository(id);
}

export async function updateOpportunityService(id: string, data: Partial<CreateOpportunityInput>) {
    try {
        return await updateOpportunityRepository(id, data);
    } catch (e: any) {
        if (e?.code === 'P2025') throw { code: 'NOT_FOUND' };
        throw e;
    }
}

export async function deleteOpportunityService(id: string) {
    try {
        await deleteOpportunityRepository(id);
    } catch (e: any) {
        if (e?.code === 'P2025') throw { code: 'NOT_FOUND' };
        throw e;
    }
}

export async function listOpportunitiesService(filters: ListFilters) {
    return listWithFiltersRepository(filters);
}


