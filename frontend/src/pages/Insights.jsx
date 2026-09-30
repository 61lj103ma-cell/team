import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Layers,
  ArrowRight,
  ShieldAlert,
  Compass
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import api from '../services/api';
import { AIInsightCard } from '../components/AIInsightCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export const Insights = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analytics/insights');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-800 rounded-lg w-1/4 animate-pulse"></div>
        <LoadingSkeleton count={3} />
        <div className="h-72 bg-slate-900 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  const { insights = [], departmentBreakdown = [], summary = {} } = data || {};

  const deptChartData = departmentBreakdown.map((d) => ({
    name: d._id || 'Other',
    total: d.total,
    critical: d.critical,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            AI Management Insights & Strategic Analysis
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
              Generative Intelligence
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Autonomous operational telemetry synthesis detecting systemic bottlenecks and incident recurrence patterns.
          </p>
        </div>

        <button
          onClick={fetchInsights}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Re-Analyze Database State
        </button>
      </div>

      {/* Strategic AI Insights Cards */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          Autonomous Diagnostic Findings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {insights.map((ins, idx) => (
            <AIInsightCard key={idx} insight={ins} />
          ))}
        </div>
      </div>

      {/* Visual Chart: Department Incident Saturation & Critical Vulnerabilities */}
      <div className="rounded-3xl bg-[#111827]/90 border border-slate-800 p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              Department Risk & Saturation Matrix
            </h3>
            <p className="text-xs text-slate-400">Total incidents vs Critical SLA violations across operational units</p>
          </div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deptChartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
              />
              <Bar dataKey="total" fill="#06b6d4" name="Total Incidents" radius={[4, 4, 0, 0]} />
              <Bar dataKey="critical" fill="#f43f5e" name="Critical Severity" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Executive Action Directives */}
      <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          Operational Directives For Leadership
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <span className="font-bold text-rose-400">1. Payment Failure Redundancy</span>
            <p className="text-slate-300 leading-relaxed">
              Payment gateway disruptions generate 70% of high customer friction alerts. Implement multi-vendor active-active failover between primary Stripe and secondary Adyen processors.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <span className="font-bold text-cyan-400">2. Automated Triage Routing</span>
            <p className="text-slate-300 leading-relaxed">
              FlowPilot AI reduces assignment delay by 64% when human managers verify initial AI suggestions within the first 10 minutes of intake.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
