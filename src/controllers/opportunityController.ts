// src/controllers/opportunityController.ts
import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { ApiError } from '../utils/errorHandler';

// Get all opportunities with optional filtering
export const getAllOpportunities = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, category, location, isRemote } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = {};
    if (category) where.category = category;
    if (location) where.location = { contains: location as string, mode: 'insensitive' };
    if (isRemote !== undefined) where.isRemote = isRemote === 'true';
    
    const [opportunities, total] = await Promise.all([
      prisma.opportunity.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.opportunity.count({ where })
    ]);
    
    res.json({
      data: opportunities,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        hasMore: skip + Number(limit) < total
      }
    });
  } catch (err: unknown) {
    console.error('Error fetching opportunities:', err);
    res.status(500).json({
      error: 'Failed to fetch opportunities',
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
};

// Get single opportunity by ID
export const getOpportunityById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const opportunity = await prisma.opportunity.findUnique({
      where: { id }
    });
    
    if (!opportunity) {
      res.status(404).json({
        error: 'Opportunity not found'
      });
      return;
    }
    
    res.json({
      data: opportunity
    });
  } catch (err: unknown) {
    console.error('Error fetching opportunity:', err);
    res.status(500).json({
      error: 'Failed to fetch opportunity',
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
};

// Create new opportunity
export const createOpportunity = async (req: Request, res: Response) => {
  try {
    const { 
      title, 
      description, 
      category, 
      location, 
      isRemote, 
      deadline,
      contactEmail,
      organization,
      image,
      excerpt,
      requirements,
      tags
    } = req.body;
    
    // Get user ID from authenticated request
    const createdBy = req.user?.id;
    
    if (!createdBy) {
      res.status(401).json({
        error: 'User not authenticated'
      });
      return;
    }
    
    const opportunity = await prisma.opportunity.create({
      data: {
        title,
        description,
        category,
        location,
        isRemote: isRemote || false,
        deadline: deadline ? new Date(deadline) : null,
        contactEmail,
        organization,
        image,
        excerpt,
        requirements,
        tags: tags || [],
        createdBy
      }
    });
    
    res.status(201).json({
      message: 'Opportunity created successfully!',
      data: opportunity
    });
  } catch (err: unknown) {
    console.error('Error creating opportunity:', err);
    res.status(400).json({
      error: 'Failed to create opportunity',
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
};

// Update opportunity
export const updateOpportunity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      description, 
      category, 
      location, 
      isRemote, 
      deadline,
      contactEmail,
      organization,
      image,
      excerpt,
      requirements,
      tags
    } = req.body;
    
    // Check if opportunity exists and user owns it
    const existingOpportunity = await prisma.opportunity.findUnique({
      where: { id }
    });
    
    if (!existingOpportunity) {
      res.status(404).json({
        error: 'Opportunity not found'
      });
      return;
    }
    
    // Check ownership
    if (!req.user?.id) {
      res.status(401).json({
        error: 'User not authenticated'
      });
      return;
    }
    if (existingOpportunity.createdBy !== req.user.id) {
      res.status(403).json({
        error: 'You do not have permission to update this opportunity'
      });
      return;
    }
    
    const opportunity = await prisma.opportunity.update({
      where: { id },
      data: {
        title,
        description,
        category,
        location,
        isRemote,
        deadline: deadline ? new Date(deadline) : null,
        contactEmail,
        organization,
        image,
        excerpt,
        requirements,
        tags,
        updatedAt: new Date()
      }
    });
    
    res.json({
      message: 'Opportunity updated successfully!',
      data: opportunity
    });
  } catch (err: unknown) {
    console.error('Error updating opportunity:', err);
    res.status(400).json({
      error: 'Failed to update opportunity',
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
};

// Delete opportunity
export const deleteOpportunity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if opportunity exists and user owns it
    const existingOpportunity = await prisma.opportunity.findUnique({
      where: { id }
    });
    
    if (!existingOpportunity) {
      res.status(404).json({
        error: 'Opportunity not found'
      });
      return;
    }
    
    // Check ownership
        if (!req.user?.id) {
          res.status(401).json({
            error: 'User not authenticated'
          });
          return;
        }
        if (existingOpportunity.createdBy !== req.user.id) {
          res.status(403).json({
            error: 'You do not have permission to delete this opportunity'
          });
          return;
        }
    
    await prisma.opportunity.delete({
      where: { id }
    });
    
    res.json({
      message: 'Opportunity deleted successfully!'
    });
  } catch (err: unknown) {
    console.error('Error deleting opportunity:', err);
    res.status(400).json({
      error: 'Failed to delete opportunity',
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
};

// Get internships only
export const getInternships = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, location, isRemote } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = { category: 'INTERNSHIP' };
    if (location) where.location = { contains: location as string, mode: 'insensitive' };
    if (isRemote !== undefined) where.isRemote = isRemote === 'true';
    
    const [opportunities, total] = await Promise.all([
      prisma.opportunity.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.opportunity.count({ where })
    ]);
    
    res.json({
      data: opportunities,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        hasMore: skip + Number(limit) < total
      }
    });
  } catch (err: unknown) {
    console.error('Error fetching internships:', err);
    res.status(500).json({
      error: 'Failed to fetch internships',
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
};

// Get scholarships only
export const getScholarships = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, location, isRemote } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = { category: 'SCHOLARSHIP' };
    if (location) where.location = { contains: location as string, mode: 'insensitive' };
    if (isRemote !== undefined) where.isRemote = isRemote === 'true';
    
    const [opportunities, total] = await Promise.all([
      prisma.opportunity.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.opportunity.count({ where })
    ]);
    
    res.json({
      data: opportunities,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        hasMore: skip + Number(limit) < total
      }
    });
  } catch (err: unknown) {
    console.error('Error fetching scholarships:', err);
    res.status(500).json({
      error: 'Failed to fetch scholarships',
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
};

// Get others (everything except internships and scholarships)
export const getOthers = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, location, isRemote } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = { 
      category: { 
        notIn: ['INTERNSHIP', 'SCHOLARSHIP'] 
      } 
    };
    if (location) where.location = { contains: location as string, mode: 'insensitive' };
    if (isRemote !== undefined) where.isRemote = isRemote === 'true';
    
    const [opportunities, total] = await Promise.all([
      prisma.opportunity.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.opportunity.count({ where })
    ]);
    
    res.json({
      data: opportunities,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        hasMore: skip + Number(limit) < total
      }
    });
  } catch (err: unknown) {
    console.error('Error fetching other opportunities:', err);
    res.status(500).json({
      error: 'Failed to fetch other opportunities',
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
};

// Search opportunities
export const searchOpportunities = async (req: Request, res: Response) => {
  try {
    const { q, category, location, isRemote, organization, tags, page = 1, limit = 20 } = req.query;
    
    if (!q) {
      res.status(400).json({
        error: 'Search query (q) is required'
      });
      return;
    }
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = {
      OR: [
        { title: { contains: q as string, mode: 'insensitive' } },
        { description: { contains: q as string, mode: 'insensitive' } },
        { location: { contains: q as string, mode: 'insensitive' } },
        { organization: { contains: q as string, mode: 'insensitive' } },
        { requirements: { contains: q as string, mode: 'insensitive' } }
      ]
    };
    
    if (category) where.category = category;
    if (location) where.location = { contains: location as string, mode: 'insensitive' };
    if (isRemote !== undefined) where.isRemote = isRemote === 'true';
    if (organization) where.organization = { contains: organization as string, mode: 'insensitive' };
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      where.tags = { hasSome: tagArray as string[] };
    }
    
    const [opportunities, total] = await Promise.all([
      prisma.opportunity.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.opportunity.count({ where })
    ]);
    
    res.json({
      query: q,
      data: opportunities,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        hasMore: skip + Number(limit) < total
      }
    });
  } catch (err: unknown) {
    console.error('Error searching opportunities:', err);
    res.status(500).json({
      error: 'Failed to search opportunities',
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
};
