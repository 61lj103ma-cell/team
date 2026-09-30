const Activity = require('../models/Activity');
const Notification = require('../models/Notification');

/**
 * Log activity and optionally trigger notifications
 */
const logActivity = async ({ user, userName, action, incident, incidentCode, task, metadata }) => {
  try {
    const entry = await Activity.create({
      user: user?._id || user || null,
      userName: userName || user?.name || 'System',
      action,
      incident: incident?._id || incident || null,
      incidentCode: incidentCode || incident?.incidentId || '',
      task: task?._id || task || null,
      metadata: metadata || {},
    });
    return entry;
  } catch (error) {
    console.error('[ActivityService] Error logging activity:', error.message);
  }
};

const sendNotification = async ({ userId, title, message, type = 'info', link = '' }) => {
  try {
    if (!userId) return null;
    return await Notification.create({
      user: userId,
      title,
      message,
      type,
      link,
    });
  } catch (error) {
    console.error('[ActivityService] Error sending notification:', error.message);
  }
};

module.exports = { logActivity, sendNotification };
