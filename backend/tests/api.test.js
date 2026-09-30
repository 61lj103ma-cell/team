const test = require('node:test');
const assert = require('node:assert/strict');
const { registerSchema, loginSchema } = require('../src/validators/auth.validator');
const { createIncidentSchema } = require('../src/validators/incident.validator');
const { createTaskSchema } = require('../src/validators/task.validator');
const aiService = require('../src/services/ai.service');

test('Validation: registerSchema validates correct employee payload', () => {
  const payload = {
    name: 'Jane Doe',
    email: 'jane@enterprise.com',
    password: 'SecurePassword123!',
    role: 'EMPLOYEE',
    department: 'IT',
  };
  const result = registerSchema.safeParse(payload);
  assert.equal(result.success, true);
});

test('Validation: registerSchema rejects invalid email', () => {
  const payload = {
    name: 'Jane Doe',
    email: 'not-an-email',
    password: '123',
  };
  const result = registerSchema.safeParse(payload);
  assert.equal(result.success, false);
});

test('Validation: createIncidentSchema accepts valid incident payload', () => {
  const incident = {
    title: 'Payment Gateway Outage',
    description: 'Multiple users failing checkout transactions',
    affectedUsers: 150,
    service: 'Payment API',
    department: 'IT / Finance',
    severity: 'Critical',
    priority: 'P1',
  };
  const result = createIncidentSchema.safeParse(incident);
  assert.equal(result.success, true);
});

test('AI Service: Fallback analyzer produces valid structured incident classification', async () => {
  const result = await aiService.analyzeIncident({
    title: 'Customer Payment Failure',
    description: 'Customers are reporting 504 errors on payment checkout page',
    affectedUsers: 150,
    service: 'Stripe Gateway',
  });

  assert.equal(typeof result, 'object');
  assert.equal(result.category, 'Payment');
  assert.equal(['Critical', 'High'].includes(result.severity), true);
  assert.equal(['P1', 'P2'].includes(result.priority), true);
  assert.equal(Array.isArray(result.possibleCauses), true);
  assert.equal(Array.isArray(result.recommendedActions), true);
  assert.equal(typeof result.confidence, 'number');
});

test('Validation: createTaskSchema validates task requirements', () => {
  const task = {
    title: 'Check database lock contention',
    description: 'Inspect pg_stat_activity logs',
    priority: 'P2',
    department: 'IT',
  };
  const result = createTaskSchema.safeParse(task);
  assert.equal(result.success, true);
});
