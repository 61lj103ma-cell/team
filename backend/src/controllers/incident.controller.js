const Incident = require('../models/Incident');
const User = require('../models/User');
const { logActivity, sendNotification } = require('../services/activity.service');

// Helper to generate next sequential incident ID (e.g. INC-1001)
const getNextIncidentId = async () => {
  const lastIncident = await Incident.findOne().sort({ createdAt: -1 }).select('incidentId');
  if (!lastIncident || !lastIncident.incidentId) {
    return 'INC-1001';
  }
  const match = lastIncident.incidentId.match(/INC-(\d+)/);
  if (match && match[1]) {
    const nextNum = parseInt(match[1], 10) + 1;
    return `INC-${nextNum}`;
  }
  return `INC-${Date.now().toString().slice(-4)}`;
};

// @desc    Get all incidents with filter & pagination
// @route   GET /api/incidents
const getIncidents = async (req, res, next) => {
  try {
    const { status, severity, priority, department, search, page = 1, limit = 20 } = req.query;

    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }
    if (severity && severity !== 'all') {
      query.severity = severity;
    }
    if (priority && priority !== 'all') {
      query.priority = priority;
    }
    if (department && department !== 'all') {
      query.department = new RegExp(department, 'i');
    }
    if (search) {
      query.$or = [
        { incidentId: new RegExp(search, 'i') },
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { service: new RegExp(search, 'i') },
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Incident.countDocuments(query);

    const incidents = await Incident.find(query)
      .populate('createdBy', 'name email role department avatar')
      .populate('assignedUser', 'name email role department avatar')
      .populate('resolvedBy', 'name email role department avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    res.status(200).json({
      success: true,
      count: incidents.length,
      total,
      page: parseInt(page, 10),
      pages: Math.ceil(total / parseInt(limit, 10)) || 1,
      data: incidents,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single incident by ID or incidentId
// @route   GET /api/incidents/:id
const getIncidentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let incident = null;

    if (id.startsWith('INC-')) {
      incident = await Incident.findOne({ incidentId: id })
        .populate('createdBy', 'name email role department avatar')
        .populate('assignedUser', 'name email role department avatar')
        .populate('resolvedBy', 'name email role department avatar');
    } else {
      incident = await Incident.findById(id)
        .populate('createdBy', 'name email role department avatar')
        .populate('assignedUser', 'name email role department avatar')
        .populate('resolvedBy', 'name email role department avatar');
    }

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: `Incident not found with identifier ${id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: incident,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new incident
// @route   POST /api/incidents
const createIncident = async (req, res, next) => {
  try {
    const incidentId = await getNextIncidentId();

    const incident = await Incident.create({
      ...req.body,
      incidentId,
      createdBy: req.user._id,
    });

    await logActivity({
      user: req.user._id,
      userName: req.user.name,
      action: `Incident ${incidentId} created: "${incident.title}"`,
      incident: incident._id,
      incidentCode: incidentId,
      metadata: { severity: incident.severity, priority: incident.priority, department: incident.department },
    });

    // Notify managers if critical
    if (incident.severity === 'Critical') {
      const managers = await User.find({ role: { $in: ['MANAGER', 'ADMIN'] } });
      for (const m of managers) {
        await sendNotification({
          userId: m._id,
          title: `CRITICAL Incident ${incidentId}`,
          message: `High-impact incident "${incident.title}" reported in ${incident.department}. Immediate triage needed.`,
          type: 'critical',
          link: `/incidents/${incidentId}`,
        });
      }
    }

    const populated = await Incident.findById(incident._id).populate('createdBy', 'name email role department avatar');

    res.status(201).json({
      success: true,
      message: 'Incident reported and recorded successfully',
      data: populated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update incident (status, assignment, details, resolution)
// @route   PUT /api/incidents/:id
const updateIncident = async (req, res, next) => {
  try {
    const { id } = req.params;
    let incident = await Incident.findOne({ $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { incidentId: id }] });

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incident not found',
      });
    }

    const prevStatus = incident.status;
    const prevAssignee = incident.assignedUser?.toString();
    const prevSeverity = incident.severity;

    // Apply updates
    Object.assign(incident, req.body);

    // If resolving
    if (req.body.status === 'Resolved' && prevStatus !== 'Resolved') {
      incident.resolvedAt = new Date();
      incident.resolvedBy = req.user._id;

      await logActivity({
        user: req.user._id,
        userName: req.user.name,
        action: `Incident ${incident.incidentId} marked as Resolved`,
        incident: incident._id,
        incidentCode: incident.incidentId,
        metadata: { rootCause: incident.rootCause, resolutionSummary: incident.resolutionSummary },
      });

      if (incident.createdBy) {
        await sendNotification({
          userId: incident.createdBy,
          title: `Incident Resolved: ${incident.incidentId}`,
          message: `Your reported incident "${incident.title}" has been successfully resolved.`,
          type: 'success',
          link: `/incidents/${incident.incidentId}`,
        });
      }
    } else if (req.body.status && req.body.status !== prevStatus) {
      await logActivity({
        user: req.user._id,
        userName: req.user.name,
        action: `Status changed from ${prevStatus} to ${req.body.status}`,
        incident: incident._id,
        incidentCode: incident.incidentId,
      });
    }

    // Assignment change
    if (req.body.assignedUser && req.body.assignedUser !== prevAssignee) {
      const assignedTo = await User.findById(req.body.assignedUser);
      await logActivity({
        user: req.user._id,
        userName: req.user.name,
        action: `Assigned to ${assignedTo?.name || 'Engineer'}`,
        incident: incident._id,
        incidentCode: incident.incidentId,
      });

      if (assignedTo) {
        await sendNotification({
          userId: assignedTo._id,
          title: `Incident Assigned: ${incident.incidentId}`,
          message: `You were assigned to incident "${incident.title}" (${incident.severity}).`,
          type: 'assignment',
          link: `/incidents/${incident.incidentId}`,
        });
      }
    }

    // Severity change
    if (req.body.severity && req.body.severity !== prevSeverity) {
      await logActivity({
        user: req.user._id,
        userName: req.user.name,
        action: `Severity adjusted from ${prevSeverity} to ${req.body.severity}`,
        incident: incident._id,
        incidentCode: incident.incidentId,
      });
    }

    await incident.save();

    const populated = await Incident.findById(incident._id)
      .populate('createdBy', 'name email role department avatar')
      .populate('assignedUser', 'name email role department avatar')
      .populate('resolvedBy', 'name email role department avatar');

    res.status(200).json({
      success: true,
      message: 'Incident updated successfully',
      data: populated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete an incident
// @route   DELETE /api/incidents/:id
const deleteIncident = async (req, res, next) => {
  try {
    const { id } = req.params;
    const incident = await Incident.findOneAndDelete({ $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { incidentId: id }] });

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incident not found',
      });
    }

    await logActivity({
      user: req.user._id,
      userName: req.user.name,
      action: `Incident ${incident.incidentId} deleted`,
      metadata: { title: incident.title },
    });

    res.status(200).json({
      success: true,
      message: `Incident ${incident.incidentId} removed successfully`,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get similar incidents based on category, service, and keywords
// @route   GET /api/incidents/:id/similar
const getSimilarIncidents = async (req, res, next) => {
  try {
    const { id } = req.params;
    const current = await Incident.findOne({ $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { incidentId: id }] });

    if (!current) {
      return res.status(404).json({
        success: false,
        message: 'Incident not found',
      });
    }

    // Extract significant search keywords
    const keywords = (current.title || '')
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3 && !['with', 'from', 'more', 'than', 'some', 'getting'].includes(w));

    const regexArray = keywords.map((k) => new RegExp(k, 'i'));

    const candidates = await Incident.find({
      _id: { $ne: current._id },
      $or: [
        { category: current.category },
        { service: current.service },
        { department: current.department },
        { title: { $in: regexArray } },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('incidentId title severity priority status resolutionSummary rootCause createdAt service department');

    const mapped = candidates.map((inc) => {
      let reason = 'Matched similar operational department';
      if (inc.category === current.category) {
        reason = `Same operational category: ${inc.category}`;
      } else if (inc.service && current.service && inc.service.toLowerCase() === current.service.toLowerCase()) {
        reason = `Same affected service: ${inc.service}`;
      }
      return {
        _id: inc._id,
        incidentId: inc.incidentId,
        title: inc.title,
        severity: inc.severity,
        status: inc.status,
        createdAt: inc.createdAt,
        resolution: inc.resolutionSummary || 'Resolved via standard mitigation workflow',
        similarityReason: reason,
      };
    });

    res.status(200).json({
      success: true,
      data: mapped,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getIncidents,
  getIncidentById,
  createIncident,
  updateIncident,
  deleteIncident,
  getSimilarIncidents,
};
