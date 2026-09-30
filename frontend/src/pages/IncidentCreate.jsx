import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Edit3,
  Loader2,
  RotateCcw,
  Zap,
  Info
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { SeverityBadge, PriorityBadge, AISuggestedBadge } from '../components/Badges';

export const IncidentCreate = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useLanguage();

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    affectedUsers: '',
    service: 'Payment API',
    department: 'IT',
    environment: 'Production',
    source: 'Employee Report',
    severity: 'Medium',
    priority: 'P3',
    category: 'General',
  });

  // AI Analysis State
  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [humanVerified, setHumanVerified] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Quick Demo Prefill helper
  const loadDemoScenario = () => {
    setFormData({
      title: 'Payment System Failure & Checkout Timeouts',
      description: 'More than 150 customers are getting HTTP 504 errors while making card payments on the checkout page. The transaction hangs at 3D Secure verification.',
      affectedUsers: '150',
      service: 'Payment Gateway API',
      department: 'IT',
      environment: 'Production',
      source: 'Employee Report',
      severity: 'Medium',
      priority: 'P3',
      category: 'General',
    });
    setAiAnalysis(null);
    setHumanVerified(false);
  };

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Step 1: Trigger AI Analysis
  const handleAnalyzeWithAI = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      showToast('Please provide both incident title and description before analyzing', 'warning');
      return;
    }

    setAnalyzing(true);
    try {
      const res = await api.post('/ai/analyze-draft', {
        title: formData.title,
        description: formData.description,
        affectedUsers: Number(formData.affectedUsers) || 0,
        service: formData.service,
        department: formData.department,
        environment: formData.environment,
        source: formData.source,
      });

      const analysis = res.data;
      setAiAnalysis(analysis);

      // Pre-populate form with AI recommendations for user verification
      setFormData((prev) => ({
        ...prev,
        category: analysis.category || prev.category,
        severity: analysis.severity || prev.severity,
        priority: analysis.priority || prev.priority,
        department: analysis.department?.includes('/') ? 'IT' : (analysis.department || prev.department),
      }));

      showToast('AI analysis completed. Please review and verify suggestions.', 'success');
    } catch (err) {
      showToast(err.message || 'AI analysis temporarily unavailable. You may continue manually.', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  // Step 2: Confirm and Save to Database
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      showToast('Title and description are required', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        affectedUsers: Number(formData.affectedUsers) || 0,
        humanVerified: true,
        aiAnalysis: aiAnalysis || undefined,
        aiRecommendations: aiAnalysis?.recommendedActions || [],
        aiPossibleCauses: aiAnalysis?.possibleCauses || [],
        aiConfidence: aiAnalysis?.confidence || 0,
      };

      const res = await api.post('/incidents', payload);
      showToast(`Incident ${res.data.incidentId} created successfully!`, 'success');
      navigate(`/incidents/${res.data.incidentId}`);
    } catch (err) {
      showToast(err.message || 'Failed to record incident', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with Demo Scenario Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            {t('report.title')}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t('report.subtitle')}
          </p>
        </div>

        <button
          type="button"
          onClick={loadDemoScenario}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border border-purple-500/30 text-purple-300 hover:text-white hover:border-purple-500/60 transition-all shadow-glow-indigo"
        >
          <Zap className="w-3.5 h-3.5 text-purple-400" />
          {t('report.loadDemo')}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Natural Language Incident Description Card */}
        <div className="rounded-3xl bg-[#111827]/90 border border-slate-800/80 p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              {t('report.step1Title')}
            </span>
            <span className="text-xs text-cyan-400 font-medium">{t('report.plainEnglish')}</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t('report.incidentTitle')} <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              name="title"
              required
              placeholder="e.g. Payment Gateway Failure or Customer Login Timeout"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm text-white placeholder-slate-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t('report.incidentDesc')} <span className="text-rose-400">*</span>
            </label>
            <textarea
              name="description"
              required
              rows={4}
              placeholder="Describe symptoms, customer impact, or error messages (e.g. More than 100 customers are getting an error while making payment)..."
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm text-white placeholder-slate-400 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t('report.affectedUsers')}
              </label>
              <input
                type="number"
                name="affectedUsers"
                placeholder="e.g. 150"
                value={formData.affectedUsers}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t('report.service')}
              </label>
              <input
                type="text"
                name="service"
                placeholder="e.g. Payment API, Auth Gateway"
                value={formData.service}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t('report.environment')}
              </label>
              <select
                name="environment"
                value={formData.environment}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white outline-none cursor-pointer"
              >
                <option value="Production">Production</option>
                <option value="Staging">Staging</option>
                <option value="Development">Development</option>
                <option value="Internal">Internal</option>
              </select>
            </div>
          </div>

          {/* AI Trigger Action Banner */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleAnalyzeWithAI}
              disabled={analyzing || !formData.title.trim()}
              className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-300 hover:opacity-95 shadow-glow-cyan transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
                  <span>{t('report.analyzingAI')}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-slate-950" />
                  <span>{t('report.analyzeWithAI')}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Step 2: AI Suggestions & Human Verification Screen */}
        {aiAnalysis && (
          <div className="rounded-3xl bg-[#111827]/95 border-2 border-cyan-500/40 p-6 shadow-glow-cyan space-y-5 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <AISuggestedBadge text={t('report.aiDiagnosticSuggestions')} />
                <span className="text-xs text-slate-400">
                  {t('report.confidence')}: <span className="text-cyan-400 font-mono font-bold">{aiAnalysis.confidence}%</span>
                </span>
              </div>
              <span className="text-xs text-amber-400 font-semibold flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                {t('report.humanVerificationRequired')}
              </span>
            </div>

            {/* AI Reasoning Summary */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <span className="font-bold text-cyan-400 mr-1.5">AI Summary:</span>
              {aiAnalysis.summary}
            </div>

            {/* Editable AI Classification Fields (Human-in-the-Loop) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                  <span>{t('report.severity')}</span>
                  <AISuggestedBadge text={aiAnalysis.severity} />
                </label>
                <select
                  name="severity"
                  value={formData.severity}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-cyan-500/40 text-sm font-bold text-rose-300 outline-none cursor-pointer"
                >
                  <option value="Critical">Critical (P1 / Revenue impact)</option>
                  <option value="High">High (Major degraded service)</option>
                  <option value="Medium">Medium (Workaround available)</option>
                  <option value="Low">Low (Minor internal defect)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                  <span>{t('report.priority')}</span>
                  <AISuggestedBadge text={aiAnalysis.priority} />
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-cyan-500/40 text-sm font-bold text-amber-300 outline-none cursor-pointer"
                >
                  <option value="P1">P1 - Immediate Intervention</option>
                  <option value="P2">P2 - Urgent Attention</option>
                  <option value="P3">P3 - Standard Priority</option>
                  <option value="P4">P4 - Low Urgency</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                  <span>{t('report.assignedDept')}</span>
                  <AISuggestedBadge text={aiAnalysis.department} />
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-cyan-500/40 text-sm font-bold text-slate-100 outline-none cursor-pointer"
                >
                  <option value="IT">IT</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                  <option value="Customer Support">Customer Support</option>
                  <option value="HR">HR</option>
                  <option value="Security">Security</option>
                </select>
              </div>
            </div>

            {/* AI Possible Causes Hypotheses */}
            {aiAnalysis.possibleCauses?.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  {t('report.rootCauseHypotheses')}
                </h4>
                <div className="space-y-2">
                  {aiAnalysis.possibleCauses.map((pc, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-white">{pc.cause}</div>
                        <div className="text-slate-400 mt-0.5">{pc.reasoning}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-cyan-300 border border-slate-700 whitespace-nowrap">
                        {pc.confidence} Conf.
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Recommended Actions */}
            {aiAnalysis.recommendedActions?.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  {t('report.recommendedTasks')}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {aiAnalysis.recommendedActions.map((ra, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                      <div className="font-semibold text-white">{ra.title}</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">{ra.explanation}</div>
                      <div className="mt-2 flex items-center gap-2 text-[10px]">
                        <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                          {ra.team}
                        </span>
                        <span className="font-mono text-amber-400">{ra.priority}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Final Submission Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => navigate('/incidents')}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {t('report.cancel')}
          </button>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 py-3 px-6 rounded-xl font-bold text-xs text-white bg-cyan-600 hover:bg-cyan-500 shadow-glow-cyan transition-all disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>{t('report.saving')}</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-white" />
                  <span>{t('report.verifyAndConfirm')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
