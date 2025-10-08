import prisma from "../utils/prisma";
// Use return types inferred from Prisma at runtime; avoid importing generated types directly
type OpportunityEntity = any;
type OpportunityCategory = 'INTERNSHIP' | 'SCHOLARSHIP' | 'COMPETITION' | 'GIG' | 'PITCH' | 'OTHER';

export type CreateOpportunityInput = {
    title: string;
    description: string;
    category: OpportunityCategory;
    location?: string | null;
    isRemote?: boolean;
    createdBy: string;
    deadline?: Date | null;
};

export async function createOpportunityRepository(data: CreateOpportunityInput): Promise<OpportunityEntity> {
    return prisma.opportunity.create({ data: {
        title: data.title,
        description: data.description,
        category: data.category,
        location: data.location ?? null,
        isRemote: data.isRemote ?? false,
        createdBy: data.createdBy,
        deadline: data.deadline ?? null,
    }});
}

export async function listOpportunitiesRepository(): Promise<OpportunityEntity[]> {
    return prisma.opportunity.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getOpportunityByIdRepository(id: string): Promise<OpportunityEntity | null> {
    return prisma.opportunity.findUnique({ where: { id } });
}

export async function updateOpportunityRepository(id: string, data: Partial<CreateOpportunityInput>): Promise<OpportunityEntity> {
    return prisma.opportunity.update({ where: { id }, data });
}

export async function deleteOpportunityRepository(id: string): Promise<void> {
    await prisma.opportunity.delete({ where: { id } });
}

export type ListFilters = {
    search?: string;
    category?: OpportunityCategory | string;
    location?: string;
    isRemote?: boolean;
    page?: number;
    limit?: number;
    sort?: string; // e.g., createdAt:desc
};

export async function listWithFiltersRepository(filters: ListFilters) {
    const where: any = {};
    if (filters.category) where.category = filters.category as any;
    if (filters.location) where.location = { contains: filters.location, mode: 'insensitive' };
    if (typeof filters.isRemote === 'boolean') where.isRemote = filters.isRemote;
    if (filters.search) {
        where.OR = [
            { title: { contains: filters.search, mode: 'insensitive' } },
            { description: { contains: filters.search, mode: 'insensitive' } },
        ];
    }
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const [sortField, sortDir] = (filters.sort || 'createdAt:desc').split(':');
    const orderBy: any = { [sortField]: (sortDir === 'asc' ? 'asc' : 'desc') };

    const [data, count] = await Promise.all([
        prisma.opportunity.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit }),
        prisma.opportunity.count({ where })
    ]);

    return { data, count, page, limit };
}


