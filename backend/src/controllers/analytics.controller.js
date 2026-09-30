const Incident = require('../models/Incident');
const Activity = require('../models/Activity');
const Task = require('../models/Task');
const aiService = require('../services/ai.service');

// @desc    Get complete enterprise dashboard overview
// @route   GET /api/analytics/dashboard
const getDashboardSummary = async (req, res, next) => {
  try {
    const totalIncidents = await Incident.countDocuments();
    const openIncidents = await Incident.countDocuments({
      status: { $in: ['Open', 'Investigating', 'In Progress', 'Monitoring'] },
    });
    const criticalIncidents = await Incident.countDocuments({ severity: 'Critical' });
    const resolvedIncidents = await Incident.countDocuments({
      status: { $in: ['Resolved', 'Closed'] },
    });

    // Calculate Average Resolution Time in minutes
    const resolvedList = await Incident.find({
      status: { $in: ['Resolved', 'Closed'] },
      resolvedAt: { $ne: null },
    }).select('createdAt resolvedAt');

    let avgResolutionMinutes = 0;
    if (resolvedList.length > 0) {
      const totalMinutes = resolvedList.reduce((acc, curr) => {
        const diffMs = new Date(curr.resolvedAt) - new Date(curr.createdAt);
        return acc + Math.max(0, diffMs / (1000 * 60));
      }, 0);
      avgResolutionMinutes = Math.round(totalMinutes / resolvedList.length);
    } else {
      avgResolutionMinutes = 48; // Baseline estimated MTTR
    }

    // Status breakdown
    const statusCounts = await Incident.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const statusMap = {
      Open: 0,
      Investigating: 0,
      'In Progress': 0,
      Monitoring: 0,
      Resolved: 0,
      Closed: 0,
    };
    statusCounts.forEach((sc) => {
      if (sc._id) statusMap[sc._id] = sc.count;
    });

    // Severity breakdown
    const severityCounts = await Incident.aggregate([
      { $group: { _id: '$severity', count: { $sum: 1 } } },
    ]);
    const severityMap = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    severityCounts.forEach((sc) => {
      if (sc._id) severityMap[sc._id] = sc.count;
    });

    // Department breakdown
    const departmentCounts = await Incident.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Category breakdown
    const categoryCounts = await Incident.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Recent Incidents
    const recentIncidents = await Incident.find()
      .populate('assignedUser', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(6);

    // Recent Activity
    const recentActivities = await Activity.find()
      .populate('user', 'name email avatar role')
      .sort({ createdAt: -1 })
      .limit(8);

    // Generate AI Insights from real aggregated metrics
    const deptObj = {};
    departmentCounts.forEach((d) => (deptObj[d._id || 'Other'] = d.count));
    const catObj = {};
    categoryCounts.forEach((c) => (catObj[c._id || 'General'] = c.count));

    const aiInsights = await aiService.generateManagementInsights({
      totalIncidents,
      openIncidents,
      criticalCount: criticalIncidents,
      resolvedCount: resolvedIncidents,
      departmentCounts: deptObj,
      categoryCounts: catObj,
    });

    res.status(200).json({
      success: true,
      data: {
        kpis: {
          totalIncidents,
          openIncidents,
          criticalIncidents,
          resolvedIncidents,
          avgResolutionMinutes,
        },
        statusDistribution: statusMap,
        severityDistribution: severityMap,
        departmentDistribution: departmentCounts.map((d) => ({
          department: d._id || 'Unassigned',
          count: d.count,
        })),
        categoryDistribution: categoryCounts.map((c) => ({
          category: c._id || 'General',
          count: c.count,
        })),
        recentIncidents,
        recentActivities,
        aiInsights,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get detailed incident analytics and timeline trends
// @route   GET /api/analytics/incidents
const getIncidentAnalytics = async (req, res, next) => {
  try {
    // Generate trend over last 7 days
    const days = 7;
    const trendData = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const startOfDay = new Date(d.setHours(0, 0, 0, 0));
      const endOfDay = new Date(d.setHours(23, 59, 59, 999));

      const count = await Incident.countDocuments({
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      });
      const resolvedCount = await Incident.countDocuments({
        resolvedAt: { $gte: startOfDay, $lte: endOfDay },
      });
      const criticalCount = await Incident.countDocuments({
        severity: 'Critical',
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      });

      const dayLabel = startOfDay.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      trendData.push({
        date: dayLabel,
        reported: count,
        resolved: resolvedCount,
        critical: criticalCount,
      });
    }

    // Category breakdown
    const categories = await Incident.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, avgAffected: { $avg: '$affectedUsers' } } },
      { $sort: { count: -1 } },
    ]);

    // Priority breakdown
    const priorities = await Incident.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        trendData,
        categories: categories.map((c) => ({ name: c._id || 'Other', count: c.count, avgAffected: Math.round(c.avgAffected || 0) })),
        priorities: priorities.map((p) => ({ priority: p._id || 'P3', count: p.count })),
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get dedicated AI insights and anomaly detections
// @route   GET /api/analytics/insights
const getInsightsPage = async (req, res, next) => {
  try {
    const total = await Incident.countDocuments();
    const critical = await Incident.countDocuments({ severity: 'Critical' });
    const open = await Incident.countDocuments({ status: { $in: ['Open', 'Investigating', 'In Progress'] } });
    const resolved = await Incident.countDocuments({ status: 'Resolved' });

    const departments = await Incident.aggregate([
      { $group: { _id: '$department', total: { $sum: 1 }, critical: { $sum: { $cond: [{ $eq: ['$severity', 'Critical'] }, 1, 0] } } } },
    ]);

    const categories = await Incident.aggregate([
      { $group: { _id: '$category', total: { $sum: 1 } } },
    ]);

    const deptMap = {};
    departments.forEach((d) => (deptMap[d._id || 'General'] = d.total));
    const catMap = {};
    categories.forEach((c) => (catMap[c._id || 'General'] = c.total));

    const insights = await aiService.generateManagementInsights({
      totalIncidents: total,
      openIncidents: open,
      criticalCount: critical,
      resolvedCount: resolved,
      departmentCounts: deptMap,
      categoryCounts: catMap,
    });

    res.status(200).json({
      success: true,
      data: {
        insights,
        departmentBreakdown: departments,
        summary: { total, critical, open, resolved },
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardSummary,
  getIncidentAnalytics,
  getInsightsPage,
};
