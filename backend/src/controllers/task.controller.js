const Task = require('../models/Task');
const Incident = require('../models/Incident');
const User = require('../models/User');
const { logActivity, sendNotification } = require('../services/activity.service');

// @desc    Get all tasks with filters and pagination
// @route   GET /api/tasks
const getTasks = async (req, res, next) => {
  try {
    const { status, priority, department, assignee, search, incidentId, page = 1, limit = 20 } = req.query;

    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }
    if (priority && priority !== 'all') {
      query.priority = priority;
    }
    if (department && department !== 'all') {
      query.department = new RegExp(department, 'i');
    }
    if (assignee && assignee !== 'all') {
      query.assignedUser = assignee;
    }
    if (incidentId) {
      query.incidentId = incidentId;
    }
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { assignedTeam: new RegExp(search, 'i') },
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Task.countDocuments(query);

    const tasks = await Task.find(query)
      .populate('assignedUser', 'name email role department avatar')
      .populate('createdBy', 'name email role department avatar')
      .populate('incidentId', 'incidentId title severity priority status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    res.status(200).json({
      success: true,
      count: tasks.length,
      total,
      page: parseInt(page, 10),
      pages: Math.ceil(total / parseInt(limit, 10)) || 1,
      data: tasks,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get task by ID
// @route   GET /api/tasks/:id
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedUser', 'name email role department avatar')
      .populate('createdBy', 'name email role department avatar')
      .populate('incidentId', 'incidentId title severity priority status');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new task
// @route   POST /api/tasks
const createTask = async (req, res, next) => {
  try {
    let incidentCode = '';
    let incidentObj = null;

    if (req.body.incidentId) {
      incidentObj = await Incident.findById(req.body.incidentId);
      if (incidentObj) {
        incidentCode = incidentObj.incidentId;
      }
    }

    const task = await Task.create({
      ...req.body,
      incidentCode,
      createdBy: req.user._id,
    });

    await logActivity({
      user: req.user._id,
      userName: req.user.name,
      action: `Created task: "${task.title}"${incidentCode ? ` for ${incidentCode}` : ''}`,
      incident: incidentObj?._id || null,
      incidentCode: incidentCode,
      task: task._id,
      metadata: { priority: task.priority, department: task.department },
    });

    // Notify assigned user if specified
    if (task.assignedUser) {
      await sendNotification({
        userId: task.assignedUser,
        title: 'New Task Assignment',
        message: `You were assigned task "${task.title}" (${task.priority})`,
        type: 'assignment',
        link: '/tasks',
      });
    }

    const populated = await Task.findById(task._id)
      .populate('assignedUser', 'name email role department avatar')
      .populate('createdBy', 'name email role department avatar')
      .populate('incidentId', 'incidentId title severity priority status');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: populated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update task status or details
// @route   PUT /api/tasks/:id
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const prevStatus = task.status;
    const prevAssignee = task.assignedUser?.toString();

    Object.assign(task, req.body);
    await task.save();

    if (req.body.status && req.body.status !== prevStatus) {
      await logActivity({
        user: req.user._id,
        userName: req.user.name,
        action: `Task "${task.title}" status changed to ${req.body.status}`,
        incident: task.incidentId,
        incidentCode: task.incidentCode,
        task: task._id,
      });
    }

    if (req.body.assignedUser && req.body.assignedUser !== prevAssignee) {
      const assignedTo = await User.findById(req.body.assignedUser);
      if (assignedTo) {
        await sendNotification({
          userId: assignedTo._id,
          title: 'Task Assigned',
          message: `Task "${task.title}" was assigned to you.`,
          type: 'assignment',
          link: '/tasks',
        });
      }
    }

    const populated = await Task.findById(task._id)
      .populate('assignedUser', 'name email role department avatar')
      .populate('createdBy', 'name email role department avatar')
      .populate('incidentId', 'incidentId title severity priority status');

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: populated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    await logActivity({
      user: req.user._id,
      userName: req.user.name,
      action: `Deleted task "${task.title}"`,
      incident: task.incidentId,
      incidentCode: task.incidentCode,
    });

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
