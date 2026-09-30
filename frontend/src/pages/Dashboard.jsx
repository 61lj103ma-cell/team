import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Activity,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  PlusCircle,
  Layers,
  PieChart as PieChartIcon,
  BarChart
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { StatCard } from '../components/StatCard';
import { AIInsightCard } from '../components/AIInsightCard';
import { IncidentTable } from '../components/IncidentTable';
import { ActivityTimeline } from '../components/ActivityTimeline';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';

export const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useLanguage();
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/analytics/dashboard');
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load enterprise dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-800 rounded-lg w-1/4 animate-pulse"></div>
        <LoadingSkeleton count={5} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-slate-900 rounded-2xl animate-pulse"></div>
          <div className="h-72 bg-slate-900 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center rounded-2xl bg-rose-500/10 border border-rose-500/20 max-w-lg mx-auto my-12">
        <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-white mb-2">Unable to Load Dashboard</h3>
        <p className="text-xs text-rose-300 mb-4">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { kpis, statusDistribution, severityDistribution, departmentDistribution, recentIncidents, recentActivities, aiInsights } = data;

  // Chart datasets
  const severityColors = {
    Critical: '#f43f5e',
    High: '#f59e0b',
    Medium: '#06b6d4',
    Low: '#94a3b8',
  };

  const severityChartData = Object.keys(severityDistribution || {}).map((key) => ({
    name: key,
    value: severityDistribution[key] || 0,
    color: severityColors[key] || '#06b6d4',
  }));

  const deptChartData = (departmentDistribution || []).slice(0, 5).map((d) => ({
    name: d.department,
    incidents: d.count,
  }));

  return (
    <div className="space-y-8">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            {t('dashboard.title')}
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
              {t('topbar.liveTelemetry')}
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t('dashboard.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Refresh dashboard metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/incidents/new')}
            className="flex items-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 shadow-glow-cyan transition-all"
          >
            <PlusCircle className="w-4 h-4 text-slate-950" />
            {t('incidents.reportNew')}
          </button>
        </div>
      </div>

      {/* Top 5 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title={t('dashboard.kpis.total')}
          value={kpis.totalIncidents}
          icon={Layers}
          accentColor="cyan"
          trend="+8% this week"
          trendType="up"
          description={t('dashboard.kpis.totalDesc')}
        />
        <StatCard
          title={t('dashboard.kpis.open')}
          value={kpis.openIncidents}
          icon={Clock}
          accentColor="amber"
          trend="Active in triage"
          trendType="up"
          description={t('dashboard.kpis.openDesc')}
        />
        <StatCard
          title={t('dashboard.kpis.critical')}
          value={kpis.criticalIncidents}
          icon={ShieldAlert}
          accentColor="rose"
          trend={kpis.criticalIncidents > 0 ? "Requires SLA focus" : "Zero active"}
          trendType={kpis.criticalIncidents > 0 ? "up" : "down"}
          description={t('dashboard.kpis.criticalDesc')}
        />
        <StatCard
          title={t('dashboard.kpis.resolved')}
          value={kpis.resolvedIncidents}
          icon={CheckCircle2}
          accentColor="emerald"
          trend="+15% MTTR efficiency"
          trendType="down"
          description={t('dashboard.kpis.resolvedDesc')}
        />
        <StatCard
          title={t('dashboard.kpis.mttr')}
          value={kpis.avgResolutionMinutes}
          unit="min"
          icon={Activity}
          accentColor="purple"
          trend="-22% vs last month"
          trendType="down"
          description={t('dashboard.kpis.mttrDesc')}
        />
      </div>

      {/* Section: Real AI Insights Generated From DB */}
      {aiInsights && aiInsights.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
              {t('dashboard.aiInsights')}
            </h2>
            <button
              onClick={() => navigate('/insights')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              <span>{t('dashboard.exploreInsights')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {aiInsights.map((insight, idx) => (
              <AIInsightCard key={idx} insight={insight} />
            ))}
          </div>
        </div>
      )}

      {/* Incident Status Workflow Bar */}
      <div className="rounded-2xl bg-[#111827]/80 border border-slate-800 p-5 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            {t('dashboard.pipelineProgression')}
          </h3>
          <span className="text-xs text-slate-400">{t('dashboard.liveLifecycle')}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { label: t('common.open'), count: statusDistribution.Open || 0, color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
            { label: t('common.investigating'), count: statusDistribution.Investigating || 0, color: 'text-purple-400 border-purple-500/30 bg-purple-500/10' },
            { label: t('common.inProgress'), count: statusDistribution['In Progress'] || 0, color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
            { label: t('common.monitoring'), count: statusDistribution.Monitoring || 0, color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' },
            { label: t('common.resolved'), count: statusDistribution.Resolved || 0, color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
            { label: t('common.closed'), count: statusDistribution.Closed || 0, color: 'text-slate-400 border-slate-700 bg-slate-800' },
          ].map((item, idx) => (
            <div key={idx} className={`p-3.5 rounded-xl border ${item.color} flex flex-col justify-between`}>
              <span className="text-[11px] font-semibold uppercase tracking-wider">{item.label}</span>
              <span className="text-2xl font-black mt-2">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Charts: Severity Distribution & Department Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity Mix */}
        <div className="rounded-2xl bg-[#111827]/80 border border-slate-800 p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-rose-400" />
              {t('dashboard.severityBreakdown')}
            </h3>
            <span className="text-xs text-slate-400">{t('dashboard.riskClassification')}</span>
          </div>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {severityChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#111827" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs mt-2">
            {severityChartData.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }}></span>
                <span className="text-slate-300 font-medium">{s.name}: {s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Department Distribution */}
        <div className="rounded-2xl bg-[#111827]/80 border border-slate-800 p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart className="w-4 h-4 text-cyan-400" />
              {t('dashboard.byDepartment')}
            </h3>
            <span className="text-xs text-slate-400">{t('dashboard.queueAllocation')}</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={deptChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} interval={0} angle={-15} textAnchor="end" />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="incidents" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Incidents and Live Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Incidents Table (2 Cols) */}
        <div className="lg:col-span-2 rounded-2xl bg-[#111827]/80 border border-slate-800 p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              {t('dashboard.recentIncidents')}
            </h3>
            <button
              onClick={() => navigate('/incidents')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              <span>{t('dashboard.viewAllIncidents')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentIncidents && recentIncidents.length > 0 ? (
            <IncidentTable incidents={recentIncidents} />
          ) : (
            <EmptyState
              title={t('incidents.noFound')}
              description="All systems operating at peak nominal capacity."
              actionLabel={t('incidents.reportNew')}
              onAction={() => navigate('/incidents/new')}
            />
          )}
        </div>

        {/* Live Activity Stream (1 Col) */}
        <div className="rounded-2xl bg-[#111827]/80 border border-slate-800 p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              {t('dashboard.auditStream')}
            </h3>
            <button
              onClick={() => navigate('/activity')}
              className="text-xs text-slate-400 hover:text-white"
            >
              {t('dashboard.viewAll')}
            </button>
          </div>

          <ActivityTimeline activities={recentActivities} />
        </div>
      </div>
    </div>
  );
};
