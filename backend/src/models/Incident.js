const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema(
  {
    incidentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: 'General',
      index: true,
    },
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
      index: true,
    },
    priority: {
      type: String,
      enum: ['P1', 'P2', 'P3', 'P4'],
      default: 'P3',
      index: true,
    },
    department: {
      type: String,
      default: 'IT',
      index: true,
    },
    affectedUsers: {
      type: Number,
      default: 0,
    },
    service: {
      type: String,
      default: 'Internal System',
    },
    environment: {
      type: String,
      enum: ['Production', 'Staging', 'Development', 'Internal'],
      default: 'Production',
    },
    source: {
      type: String,
      enum: ['Employee Report', 'Monitoring', 'Customer Report', 'Support Ticket', 'System Alert', 'Other'],
      default: 'Employee Report',
    },
    status: {
      type: String,
      enum: ['Open', 'Investigating', 'In Progress', 'Monitoring', 'Resolved', 'Closed'],
      default: 'Open',
      index: true,
    },
    assignedTeam: {
      type: String,
      default: '',
    },
    assignedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    aiAnalysis: {
      category: String,
      severity: String,
      priority: String,
      department: String,
      impact: String,
      affectedUsersEstimate: Number,
      summary: String,
      possibleCauses: [mongoose.Schema.Types.Mixed],
      recommendedActions: [mongoose.Schema.Types.Mixed],
      similarIncidentKeywords: [String],
      reasoningSummary: String,
      confidence: Number,
    },
    aiRecommendations: [
      {
        title: String,
        explanation: String,
        priority: String,
        team: String,
        createdAsTaskId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Task',
          default: null,
        },
      },
    ],
    aiPossibleCauses: [
      {
        cause: String,
        confidence: String,
        reasoning: String,
      },
    ],
    aiConfidence: {
      type: Number,
      default: 0,
    },
    humanVerified: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolutionSummary: {
      type: String,
      default: '',
    },
    rootCause: {
      type: String,
      default: '',
    },
    preventiveAction: {
      type: String,
      default: '',
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

incidentSchema.index({ createdAt: -1 });

const Incident = mongoose.model('Incident', incidentSchema);
module.exports = Incident;
