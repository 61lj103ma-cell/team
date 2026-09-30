const express = require('express');
const router = express.Router();
const {
  getDashboardSummary,
  getIncidentAnalytics,
  getInsightsPage,
} = require('../controllers/analytics.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/dashboard', getDashboardSummary);
router.get('/incidents', getIncidentAnalytics);
router.get('/insights', getInsightsPage);

module.exports = router;
