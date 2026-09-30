const Incident = require('../models/Incident');
const aiService = require('../services/ai.service');

// @desc    Analyze incident draft before saving (Report Incident form)
// @route   POST /api/ai/analyze-draft
const analyzeDraft = async (req, res, next) => {
  try {
    const { title, description, affectedUsers, service, department, environment, source } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required for AI analysis',
      });
    }

    const analysis = await aiService.analyzeIncident({
      title,
      description,
      affectedUsers,
      service,
      department,
      environment,
      source,
    });

    res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Re-analyze existing incident by ID
// @route   POST /api/incidents/:id/analyze
const analyzeIncident = async (req, res, next) => {
  try {
    const { id } = req.params;
    const incident = await Incident.findOne({ $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { incidentId: id }] });

    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }

    const analysis = await aiService.analyzeIncident(incident);

    incident.aiAnalysis = analysis;
    incident.aiRecommendations = analysis.recommendedActions || [];
    incident.aiPossibleCauses = analysis.possibleCauses || [];
    incident.aiConfidence = analysis.confidence || 90;
    await incident.save();

    res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Generate actionable tasks for incident
// @route   POST /api/incidents/:id/generate-tasks
const generateTasks = async (req, res, next) => {
  try {
    const { id } = req.params;
    const incident = await Incident.findOne({ $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { incidentId: id }] });

    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }

    const tasks = await aiService.generateIncidentTasks(incident);

    res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Generate Root Cause hypotheses
// @route   POST /api/incidents/:id/root-cause
const generateRootCause = async (req, res, next) => {
  try {
    const { id } = req.params;
    const incident = await Incident.findOne({ $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { incidentId: id }] });

    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }

    const causes = await aiService.generateRootCauseAnalysis(incident);

    res.status(200).json({
      success: true,
      data: causes,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Generate resolution summary
// @route   POST /api/incidents/:id/generate-summary
const generateSummary = async (req, res, next) => {
  try {
    const { id } = req.params;
    const incident = await Incident.findOne({ $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { incidentId: id }] });

    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }

    const summaryResult = await aiService.generateResolutionSummary(incident, req.body);

    res.status(200).json({
      success: true,
      data: summaryResult,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Enterprise AI Assistant Q&A grounded in live database data
// @route   POST /api/ai/assistant
const askAssistant = async (req, res, next) => {
  try {
    const { question } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, message: 'Question prompt is required' });
    }

    // Retrieve database context
    const total = await Incident.countDocuments();
    const open = await Incident.countDocuments({ status: { $in: ['Open', 'Investigating', 'In Progress', 'Monitoring'] } });
    const critical = await Incident.countDocuments({ severity: 'Critical' });
    const resolved = await Incident.countDocuments({ status: { $in: ['Resolved', 'Closed'] } });

    const recentIncidents = await Incident.find()
      .sort({ createdAt: -1 })
      .limit(15)
      .select('incidentId title severity priority department service status createdAt');

    const result = await aiService.answerEnterpriseQuestion(question, {
      stats: { total, open, critical, resolved },
      incidents: recentIncidents,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  analyzeDraft,
  analyzeIncident,
  generateTasks,
  generateRootCause,
  generateSummary,
  askAssistant,
};
