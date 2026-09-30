const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const incidentRoutes = require('./incident.routes');
const aiRoutes = require('./ai.routes');
const taskRoutes = require('./task.routes');
const analyticsRoutes = require('./analytics.routes');
const searchRoutes = require('./search.routes');
const userRoutes = require('./user.routes');
const departmentRoutes = require('./department.routes');
const notificationRoutes = require('./notification.routes');

router.use('/auth', authRoutes);
router.use('/incidents', incidentRoutes);
router.use('/ai', aiRoutes);
router.use('/tasks', taskRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/search', searchRoutes);
router.use('/users', userRoutes);
router.use('/departments', departmentRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;
