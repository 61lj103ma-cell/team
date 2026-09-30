const Incident = require('../models/Incident');
const Task = require('../models/Task');
const User = require('../models/User');

// @desc    Global search across incidents, tasks, and users
// @route   GET /api/search
const globalSearch = async (req, res, next) => {
  try {
    const { q, status, severity, priority, department } = req.query;

    if (!q || !q.trim()) {
      return res.status(200).json({
        success: true,
        data: { incidents: [], tasks: [], users: [] },
      });
    }

    const regex = new RegExp(q.trim(), 'i');

    // Incident search filter
    const incQuery = {
      $or: [
        { incidentId: regex },
        { title: regex },
        { description: regex },
        { service: regex },
        { category: regex },
        { department: regex },
        { assignedTeam: regex },
      ],
    };
    if (status && status !== 'all') incQuery.status = status;
    if (severity && severity !== 'all') incQuery.severity = severity;
    if (priority && priority !== 'all') incQuery.priority = priority;
    if (department && department !== 'all') incQuery.department = new RegExp(department, 'i');

    const incidents = await Incident.find(incQuery)
      .populate('assignedUser', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(10);

    // Task search
    const taskQuery = {
      $or: [
        { title: regex },
        { description: regex },
        { assignedTeam: regex },
        { department: regex },
      ],
    };
    if (status && status !== 'all') taskQuery.status = status;
    if (priority && priority !== 'all') taskQuery.priority = priority;

    const tasks = await Task.find(taskQuery)
      .populate('assignedUser', 'name email avatar')
      .populate('incidentId', 'incidentId title')
      .sort({ createdAt: -1 })
      .limit(10);

    // User search
    const users = await User.find({
      $or: [{ name: regex }, { email: regex }, { department: regex }, { role: regex }],
    })
      .select('name email role department avatar')
      .limit(6);

    res.status(200).json({
      success: true,
      data: {
        incidents,
        tasks,
        users,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { globalSearch };
