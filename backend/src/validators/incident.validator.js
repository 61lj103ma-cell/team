const { z } = require('zod');

const createIncidentSchema = z.object({
  title: z.string().min(3, 'Incident title must be at least 3 characters').max(200),
  description: z.string().min(5, 'Please provide an informative incident description'),
  affectedUsers: z.number().nonnegative().optional().default(0),
  service: z.string().optional().default('Internal System'),
  department: z.string().optional().default('IT'),
  environment: z.enum(['Production', 'Staging', 'Development', 'Internal']).optional().default('Production'),
  source: z.enum(['Employee Report', 'Monitoring', 'Customer Report', 'Support Ticket', 'System Alert', 'Other']).optional().default('Employee Report'),
  severity: z.enum(['Low', 'Medium', 'High', 'Critical']).optional().default('Medium'),
  priority: z.enum(['P1', 'P2', 'P3', 'P4']).optional().default('P3'),
  category: z.string().optional().default('General'),
  humanVerified: z.boolean().optional().default(false),
  aiAnalysis: z.any().optional(),
  aiRecommendations: z.array(z.any()).optional().default([]),
  aiPossibleCauses: z.array(z.any()).optional().default([]),
  aiConfidence: z.number().optional().default(0),
});

const updateIncidentSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(5).optional(),
  severity: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
  priority: z.enum(['P1', 'P2', 'P3', 'P4']).optional(),
  status: z.enum(['Open', 'Investigating', 'In Progress', 'Monitoring', 'Resolved', 'Closed']).optional(),
  department: z.string().optional(),
  assignedTeam: z.string().optional(),
  assignedUser: z.string().nullable().optional(),
  humanVerified: z.boolean().optional(),
  resolutionSummary: z.string().optional(),
  rootCause: z.string().optional(),
  preventiveAction: z.string().optional(),
});

module.exports = { createIncidentSchema, updateIncidentSchema };
