import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  Users,
  ShieldAlert,
  ArrowRight,
  Layers,
  PlusCircle,
  FileText,
  Activity as ActivityIcon,
  RefreshCw,
  Cpu,
  Check,
  Loader2,
  Trash2,
  ChevronRight
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { SeverityBadge, PriorityBadge, StatusBadge, DepartmentBadge, AISuggestedBadge } from '../components/Badges';
import { ActivityTimeline } from '../components/ActivityTimeline';
import { Modal, ConfirmDialog } from '../components/Modal';
import { formatDate, timeAgo } from '../utils/formatters';

export const IncidentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();

  const [incident, setIncident] = useState(null);
  const [similarIncidents, setSimilarIncidents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'ai' | 'tasks' | 'activity' | 'resolution'

  // Engineers list for assignment dropdown
  const [teamMembers, setTeamMembers] = useState([]);

  // AI Actions loading states
  const [aiGeneratingTasks, setAiGeneratingTasks] = useState(false);
  const [aiGeneratingSummary, setAiGeneratingSummary] = useState(false);
  const [aiRootCauseLoading, setAiRootCauseLoading] = useState(false);

  // Resolution Modal State
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolutionData, setResolutionData] = useState({
    rootCause: '',
    preventiveAction: '',
    resolutionSummary: '',
  });

  // Create Task Modal State
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'P2',
    department: 'IT',
    assignedTeam: '',
    assignedUser: '',
  });

  const fetchIncidentData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/incidents/${id}`);
      setIncident(res.data);

      setResolutionData({
        rootCause: res.data.rootCause || '',
        preventiveAction: res.data.preventiveAction || '',
        resolutionSummary: res.data.resolutionSummary || '',
      });

      // Fetch similar incidents
      try {
        const simRes = await api.get(`/incidents/${res.data._id}/similar`);
        setSimilarIncidents(simRes.data || []);
      } catch (e) {}

      // Fetch related tasks
      try {
        const taskRes = await api.get(`/tasks?incidentId=${res.data._id}`);
        setTasks(taskRes.data || []);
      } catch (e) {}

      // Fetch users for assignment dropdown
      try {
        const usersRes = await api.get('/users');
        setTeamMembers(usersRes.data || []);
      } catch (e) {}
    } catch (err) {
      showToast(err.message || 'Failed to load incident details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidentData();
  }, [id]);

  // Status transitions
  const handleStatusChange = async (newStatus) => {
    if (!incident) return;
    if (newStatus === 'Resolved') {
      setShowResolveModal(true);
      return;
    }

    try {
      const res = await api.put(`/incidents/${incident._id}`, { status: newStatus });
      setIncident(res.data);
      showToast(`Incident status updated to "${newStatus}"`, 'success');
      fetchIncidentData();
    } catch (err) {
      showToast(err.message || 'Status update failed', 'error');
    }
  };

  // Assign user
  const handleAssignUser = async (userId) => {
    try {
      const res = await api.put(`/incidents/${incident._id}`, { assignedUser: userId || null });
      setIncident(res.data);
      showToast('Incident assignment updated', 'success');
      fetchIncidentData();
    } catch (err) {
      showToast(err.message || 'Assignment failed', 'error');
    }
  };

  // Generate Tasks with AI
  const handleGenerateAITasks = async () => {
    setAiGeneratingTasks(true);
    try {
      const res = await api.post(`/incidents/${incident._id}/generate-tasks`);
      const generatedList = res.data || [];
      showToast(`AI generated ${generatedList.length} actionable tasks`, 'success');

      // Auto-create generated tasks
      for (const t of generatedList) {
        await api.post('/tasks', {
          ...t,
          incidentId: incident._id,
        });
      }

      fetchIncidentData();
      setActiveTab('tasks');
    } catch (err) {
      showToast(err.message || 'Failed to generate AI tasks', 'error');
    } finally {
      setAiGeneratingTasks(false);
    }
  };

  // 1-Click Create Task from an AI Recommendation card
  const handleCreateTaskFromRecommendation = async (rec) => {
    try {
      await api.post('/tasks', {
        title: rec.title,
        description: rec.explanation,
        priority: rec.priority || 'P2',
        department: incident.department,
        assignedTeam: rec.team || 'Backend Team',
        incidentId: incident._id,
      });
      showToast(`Task "${rec.title}" created successfully!`, 'success');
      fetchIncidentData();
      setActiveTab('tasks');
    } catch (err) {
      showToast(err.message || 'Unable to create task', 'error');
    }
  };

  // Generate Resolution Summary with AI
  const handleGenerateAISummary = async () => {
    setAiGeneratingSummary(true);
    try {
      const res = await api.post(`/incidents/${incident._id}/generate-summary`, {
        rootCause: resolutionData.rootCause,
        preventiveAction: resolutionData.preventiveAction,
      });

      setResolutionData((prev) => ({
        ...prev,
        resolutionSummary: res.data.summary,
        rootCause: res.data.rootCause,
        preventiveAction: res.data.preventiveAction,
      }));
      showToast('AI synthesized incident resolution summary', 'success');
    } catch (err) {
      showToast(err.message || 'AI summary generation error', 'error');
    } finally {
      setAiGeneratingSummary(false);
    }
  };

  // Save Resolution & Mark Status as Resolved
  const handleConfirmResolution = async () => {
    try {
      const res = await api.put(`/incidents/${incident._id}`, {
        status: 'Resolved',
        resolutionSummary: resolutionData.resolutionSummary,
        rootCause: resolutionData.rootCause,
        preventiveAction: resolutionData.preventiveAction,
      });
      setIncident(res.data);
      setShowResolveModal(false);
      showToast(`Incident ${incident.incidentId} successfully marked as Resolved`, 'success');
      fetchIncidentData();
    } catch (err) {
      showToast(err.message || 'Failed to resolve incident', 'error');
    }
  };

  // Update Task Status
  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      fetchIncidentData();
      showToast('Task updated', 'success');
    } catch (err) {
      showToast(err.message || 'Task status update failed', 'error');
    }
  };

  if (loading && !incident) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-slate-800 rounded-lg w-1/3 animate-pulse"></div>
        <div className="h-40 bg-slate-900 rounded-3xl animate-pulse"></div>
        <div className="h-96 bg-slate-900 rounded-3xl animate-pulse"></div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="p-12 text-center text-slate-400">
        Incident not found.{' '}
        <Link to="/incidents" className="text-cyan-400 underline">
          Back to Incidents
        </Link>
      </div>
    );
  }

  const workflowStatuses = ['Open', 'Investigating', 'In Progress', 'Monitoring', 'Resolved', 'Closed'];
  const currentStatusIndex = workflowStatuses.indexOf(incident.status);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Link to="/incidents" className="hover:text-white transition-colors">
          Incidents
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="font-mono text-cyan-400 font-bold">{incident.incidentId}</span>
      </div>

      {/* Incident Header Card */}
      <div className="rounded-3xl bg-[#111827]/90 border border-slate-800 p-6 shadow-card space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-base font-extrabold text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-xl border border-cyan-800">
                {incident.incidentId}
              </span>
              <SeverityBadge severity={incident.severity} />
              <PriorityBadge priority={incident.priority} />
              <StatusBadge status={incident.status} />
              <DepartmentBadge department={incident.department} />
              {incident.humanVerified && (
                <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <Check className="w-3 h-3" /> Human Verified
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {incident.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              {incident.description}
            </p>
          </div>

          {/* Quick Assign & Resolve Actions */}
          <div className="flex flex-col gap-2 shrink-0">
            {incident.status !== 'Resolved' && incident.status !== 'Closed' && (
              <button
                onClick={() => setShowResolveModal(true)}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                {t('detail.resolveIncident')}
              </button>
            )}

            {/* Engineer Assignment Select */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">{t('detail.assign')}</span>
              <select
                value={incident.assignedUser?._id || incident.assignedUser || ''}
                onChange={(e) => handleAssignUser(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 outline-none cursor-pointer"
              >
                <option value="">{t('detail.unassigned')}</option>
                {teamMembers.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Visual Lifecycle Stepper */}
        <div className="pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[10px]">{t('detail.lifecycleStage')}</span>
            <span>{t('detail.clickToAdvance')}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
            {workflowStatuses.map((st, idx) => {
              const isPast = idx < currentStatusIndex;
              const isCurrent = idx === currentStatusIndex;

              return (
                <button
                  key={st}
                  onClick={() => handleStatusChange(st)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-semibold text-center transition-all ${
                    isCurrent
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-glow-cyan'
                      : isPast
                      ? 'bg-slate-800 text-cyan-300 border border-cyan-500/20'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <div className="truncate">{st}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: t('detail.overviewTab'), icon: Layers },
          { id: 'ai', label: t('detail.aiTab'), icon: Sparkles },
          { id: 'tasks', label: `${t('detail.tasksTab')} (${tasks.length})`, icon: CheckCircle2 },
          { id: 'activity', label: t('detail.activityTab'), icon: ActivityIcon },
          { id: 'resolution', label: t('detail.resolutionTab'), icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
                isActive
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview & Metadata */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl bg-[#111827]/80 border border-slate-800 p-5 shadow-card space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Telemetry & System Parameters
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Impacted Service</span>
                  <span className="font-semibold text-white">{incident.service || 'Internal System'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Environment</span>
                  <span className="font-semibold text-cyan-300">{incident.environment}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Affected Users</span>
                  <span className="font-semibold text-white font-mono">{incident.affectedUsers || 'Unspecified'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Incident Source</span>
                  <span className="font-semibold text-white">{incident.source}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Assigned Team</span>
                  <span className="font-semibold text-white">{incident.assignedTeam || 'Unassigned'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Reported At</span>
                  <span className="font-semibold text-white font-mono">{formatDate(incident.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Similar Incidents Detection */}
            <div className="rounded-2xl bg-[#111827]/80 border border-slate-800 p-5 shadow-card space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  Similar Historical Incidents Detection
                </h3>
                <span className="text-xs text-slate-400">Pattern & Keyword Matching</span>
              </div>

              {similarIncidents.length === 0 ? (
                <p className="text-xs text-slate-400 py-3">No closely related historical incidents found.</p>
              ) : (
                <div className="space-y-2.5">
                  {similarIncidents.map((sim) => (
                    <div
                      key={sim._id}
                      onClick={() => navigate(`/incidents/${sim.incidentId}`)}
                      className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 cursor-pointer transition-colors text-xs flex items-center justify-between gap-3 group"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-cyan-400">{sim.incidentId}</span>
                          <span className="font-semibold text-white group-hover:text-cyan-200 transition-colors">
                            {sim.title}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          <span className="text-cyan-400/80">{sim.similarityReason}</span> &bull; {sim.resolution}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Col: Reporter & Lead Engineer */}
          <div className="space-y-6">
            <div className="rounded-2xl bg-[#111827]/80 border border-slate-800 p-5 shadow-card space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Stakeholders
              </h3>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <img
                    src={incident.createdBy?.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${incident.createdBy?.name || 'Reporter'}`}
                    alt="Reporter"
                    className="w-9 h-9 rounded-full object-cover border border-slate-700"
                  />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Reported By</span>
                    <span className="text-xs font-bold text-white">{incident.createdBy?.name || 'System User'}</span>
                    <span className="text-[10px] text-cyan-400 block">{incident.createdBy?.department}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <img
                    src={incident.assignedUser?.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${incident.assignedUser?.name || 'Assignee'}`}
                    alt="Assignee"
                    className="w-9 h-9 rounded-full object-cover border border-slate-700"
                  />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Assigned Engineer</span>
                    <span className="text-xs font-bold text-white">
                      {incident.assignedUser?.name || 'Not currently assigned'}
                    </span>
                    <span className="text-[10px] text-amber-400 block">{incident.assignedUser?.role || 'Pending'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: AI Root Cause Assistant & Recommendations */}
      {activeTab === 'ai' && (
        <div className="space-y-6">
          {/* Root Cause Hypotheses */}
          <div className="rounded-2xl bg-[#111827]/80 border border-slate-800 p-5 shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  AI Root Cause Assistant
                </h3>
                <p className="text-xs text-amber-400/90 font-medium mt-0.5">
                  Possible causes — human verification required. AI hypotheses are not confirmed conclusions.
                </p>
              </div>

              <AISuggestedBadge text={`${incident.aiConfidence || 92}% Confidence`} />
            </div>

            {incident.aiPossibleCauses && incident.aiPossibleCauses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {incident.aiPossibleCauses.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-semibold text-white text-xs">{item.cause}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-cyan-300 border border-slate-700">
                          {item.confidence} Confidence
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{item.reasoning}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No initial hypotheses recorded for this incident.</p>
            )}
          </div>

          {/* Actionable Recommendations with 1-Click Task Creation */}
          <div className="rounded-2xl bg-[#111827]/80 border border-slate-800 p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                AI Recommended Operational Actions
              </h3>
              <button
                onClick={handleGenerateAITasks}
                disabled={aiGeneratingTasks}
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 transition-colors"
              >
                {aiGeneratingTasks ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                Generate Tasks with AI
              </button>
            </div>

            {incident.aiRecommendations && incident.aiRecommendations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {incident.aiRecommendations.map((rec, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between gap-3">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-white text-xs">{rec.title}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-950/60 text-amber-300 border border-amber-500/30">
                          {rec.priority || 'P2'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">{rec.explanation}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                      <span className="text-slate-400">Team: <span className="text-cyan-300 font-medium">{rec.team || 'Backend'}</span></span>
                      <button
                        onClick={() => handleCreateTaskFromRecommendation(rec)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        Create Task
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No action cards available. Click "Generate Tasks with AI".</p>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Tasks */}
      {activeTab === 'tasks' && (
        <div className="rounded-2xl bg-[#111827]/80 border border-slate-800 p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              Incident Investigation & Mitigation Tasks
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerateAITasks}
                disabled={aiGeneratingTasks}
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-500/30 transition-colors"
              >
                {aiGeneratingTasks ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                Generate Tasks with AI
              </button>
              <button
                onClick={() => setShowCreateTaskModal(true)}
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Add Task
              </button>
            </div>
          </div>

          {tasks.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No tasks created yet for this incident. Click "Generate Tasks with AI" to automatically produce mitigation action steps.
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task._id}
                  className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <PriorityBadge priority={task.priority} />
                    <div>
                      <div className={`font-semibold ${task.status === 'Completed' ? 'line-through text-slate-400' : 'text-white'}`}>
                        {task.title}
                      </div>
                      <div className="text-[11px] text-slate-400">{task.description}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] text-slate-400">{task.assignedTeam || task.department}</span>
                    <select
                      value={task.status}
                      onChange={(e) => handleTaskStatusChange(task._id, e.target.value)}
                      className={`text-xs font-semibold px-2 py-1 rounded-lg border outline-none bg-slate-950 cursor-pointer ${
                        task.status === 'Completed'
                          ? 'text-emerald-400 border-emerald-500/30'
                          : task.status === 'In Progress'
                          ? 'text-amber-400 border-amber-500/30'
                          : 'text-slate-300 border-slate-700'
                      }`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Audit Activity Timeline */}
      {activeTab === 'activity' && (
        <div className="rounded-2xl bg-[#111827]/80 border border-slate-800 p-6 shadow-card space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ActivityIcon className="w-4 h-4 text-indigo-400" />
            Incident Audit Timeline
          </h3>
          <ActivityTimeline activities={incident.activityHistory || []} />
        </div>
      )}

      {/* Tab 5: Resolution Summary */}
      {activeTab === 'resolution' && (
        <div className="rounded-2xl bg-[#111827]/80 border border-slate-800 p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              Post-Mortem & Resolution Record
            </h3>
            {incident.status === 'Resolved' && (
              <span className="text-xs font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                Resolved: {formatDate(incident.resolvedAt)}
              </span>
            )}
          </div>

          {incident.status === 'Resolved' ? (
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="font-bold text-cyan-400 block mb-1 text-xs uppercase tracking-wider">
                  Executive Resolution Summary
                </span>
                <p className="text-slate-200 leading-relaxed">{incident.resolutionSummary}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="font-bold text-rose-400 block mb-1 text-xs uppercase tracking-wider">
                    Confirmed Root Cause
                  </span>
                  <p className="text-slate-200">{incident.rootCause || 'Root cause document pending approval'}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="font-bold text-emerald-400 block mb-1 text-xs uppercase tracking-wider">
                    Preventive Action Implemented
                  </span>
                  <p className="text-slate-200">{incident.preventiveAction || 'Monitoring alerts configured'}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400 space-y-3">
              <p>This incident is currently in state "{incident.status}". Once investigation completes, resolve it to synthesize post-mortem summaries.</p>
              <button
                onClick={() => setShowResolveModal(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors"
              >
                Open Resolution Workflow
              </button>
            </div>
          )}
        </div>
      )}

      {/* Resolution Modal with AI Summary Synthesizer */}
      <Modal
        isOpen={showResolveModal}
        onClose={() => setShowResolveModal(false)}
        title={`Resolve Incident ${incident.incidentId}`}
      >
        <div className="space-y-4 text-xs sm:text-sm">
          <p className="text-xs text-slate-400">
            Document findings and generate an executive resolution summary with AI before marking as resolved.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Root Cause Findings
            </label>
            <input
              type="text"
              placeholder="e.g. Upstream payment gateway timeout caused by TLS handshake latency..."
              value={resolutionData.rootCause}
              onChange={(e) => setResolutionData((prev) => ({ ...prev, rootCause: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Preventive Action
            </label>
            <input
              type="text"
              placeholder="e.g. Configured automatic circuit breaker fallback to secondary processor..."
              value={resolutionData.preventiveAction}
              onChange={(e) => setResolutionData((prev) => ({ ...prev, preventiveAction: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-white outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300">
                Resolution Summary
              </label>
              <button
                type="button"
                onClick={handleGenerateAISummary}
                disabled={aiGeneratingSummary}
                className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                {aiGeneratingSummary ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                Generate Resolution Summary with AI
              </button>
            </div>
            <textarea
              rows={4}
              placeholder="Click 'Generate Resolution Summary with AI' or manually write post-mortem summary..."
              value={resolutionData.resolutionSummary}
              onChange={(e) => setResolutionData((prev) => ({ ...prev, resolutionSummary: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-white outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              onClick={() => setShowResolveModal(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmResolution}
              disabled={!resolutionData.resolutionSummary}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 transition-colors"
            >
              Confirm & Mark Resolved
            </button>
          </div>
        </div>
      </Modal>

      {/* Manual Task Creation Modal */}
      <Modal
        isOpen={showCreateTaskModal}
        onClose={() => setShowCreateTaskModal(false)}
        title="Add Operational Task"
      >
        <div className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Task Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Inspect connection pool saturation"
              value={taskForm.title}
              onChange={(e) => setTaskForm((prev) => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Task Description</label>
            <textarea
              rows={3}
              placeholder="Detailed instructions for the engineer..."
              value={taskForm.description}
              onChange={(e) => setTaskForm((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
              <select
                value={taskForm.priority}
                onChange={(e) => setTaskForm((prev) => ({ ...prev, priority: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-white outline-none"
              >
                <option value="P1">P1 - Immediate</option>
                <option value="P2">P2 - Urgent</option>
                <option value="P3">P3 - Standard</option>
                <option value="P4">P4 - Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned Engineer</label>
              <select
                value={taskForm.assignedUser}
                onChange={(e) => setTaskForm((prev) => ({ ...prev, assignedUser: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none"
              >
                <option value="">Unassigned</option>
                {teamMembers.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              onClick={() => setShowCreateTaskModal(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                if (!taskForm.title) return;
                try {
                  await api.post('/tasks', {
                    ...taskForm,
                    incidentId: incident._id,
                  });
                  setShowCreateTaskModal(false);
                  showToast('Task added to incident', 'success');
                  fetchIncidentData();
                } catch (e) {
                  showToast(e.message, 'error');
                }
              }}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors"
            >
              Create Task
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
