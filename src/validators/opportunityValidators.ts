// src/validators/opportunityValidators.ts
import Joi from 'joi';

export const createOpportunitySchema = Joi.object({
  title: Joi.string().min(3).max(255).required().messages({
    'string.empty': 'Title is required',
    'string.min': 'Title must be at least 3 characters',
    'string.max': 'Title cannot exceed 255 characters'
  }),
  description: Joi.string().min(10).required().messages({
    'string.empty': 'Description is required',
    'string.min': 'Description must be at least 10 characters'
  }),
  category: Joi.string()
    .valid('INTERNSHIP', 'SCHOLARSHIP', 'COMPETITION', 'GIG', 'PITCH', 'OTHER')
    .required()
    .messages({
      'any.only': 'Category must be one of: INTERNSHIP, SCHOLARSHIP, COMPETITION, GIG, PITCH, OTHER',
      'string.empty': 'Category is required'
    }),
  location: Joi.string().max(255).optional().allow(null, ''),
  isRemote: Joi.boolean().optional(),
  deadline: Joi.date().iso().optional().allow(null),
  createdBy: Joi.string().uuid().optional() // Optional since we'll get it from auth token
});

export const updateOpportunitySchema = Joi.object({
  title: Joi.string().min(3).max(255).optional(),
  description: Joi.string().min(10).optional(),
  category: Joi.string()
    .valid('INTERNSHIP', 'SCHOLARSHIP', 'COMPETITION', 'GIG', 'PITCH', 'OTHER')
    .optional(),
  location: Joi.string().max(255).optional().allow(null, ''),
  isRemote: Joi.boolean().optional(),
  deadline: Joi.date().iso().optional().allow(null)
});

export const queryParamsSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  category: Joi.string()
    .valid('INTERNSHIP', 'SCHOLARSHIP', 'COMPETITION', 'GIG', 'PITCH', 'OTHER')
    .optional(),
  location: Joi.string().optional(),
  isRemote: Joi.string().valid('true', 'false').optional(),
  q: Joi.string().optional()
});
