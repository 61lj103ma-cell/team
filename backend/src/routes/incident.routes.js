const express = require('express');
const router = express.Router();
const {
  getIncidents,
  getIncidentById,
  createIncident,
  updateIncident,
  deleteIncident,
  getSimilarIncidents,
} = require('../controllers/incident.controller');
const {
  analyzeIncident,
  generateTasks,
  generateRootCause,
  generateSummary,
} = require('../controllers/ai.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');
const { createIncidentSchema, updateIncidentSchema } = require('../validators/incident.validator');

// All incident routes are protected
router.use(protect);

router.get('/', getIncidents);
router.post('/', validate(createIncidentSchema), createIncident);
router.get('/:id', getIncidentById);
router.put('/:id', validate(updateIncidentSchema), updateIncident);
router.delete('/:id', restrictTo('MANAGER', 'ADMIN'), deleteIncident);

router.get('/:id/similar', getSimilarIncidents);

// Incident AI actions
router.post('/:id/analyze', analyzeIncident);
router.post('/:id/generate-tasks', generateTasks);
router.post('/:id/root-cause', generateRootCause);
router.post('/:id/generate-summary', generateSummary);

module.exports = router;
