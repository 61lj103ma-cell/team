const { z } = require('zod');

const createTaskSchema = z.object({
  title: z.string().min(2, 'Task title is required').max(200),
  description: z.string().optional().default(''),
  priority: z.enum(['P1', 'P2', 'P3', 'P4']).optional().default('P2'),
  status: z.enum(['Pending', 'In Progress', 'Completed', 'Cancelled']).optional().default('Pending'),
  department: z.string().optional().default('IT'),
  assignedUser: z.string().nullable().optional(),
  assignedTeam: z.string().optional().default(''),
  incidentId: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
});

const updateTaskSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  priority: z.enum(['P1', 'P2', 'P3', 'P4']).optional(),
  status: z.enum(['Pending', 'In Progress', 'Completed', 'Cancelled']).optional(),
  assignedUser: z.string().nullable().optional(),
  assignedTeam: z.string().optional(),
  department: z.string().optional(),
  dueDate: z.string().optional().nullable(),
});

module.exports = { createTaskSchema, updateTaskSchema };
